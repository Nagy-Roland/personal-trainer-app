// src/utils/instructionParser.js
import React from 'react';

export function cleanAndFormatInstructions(rawDescription) {
  if (!rawDescription) return null;

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = rawDescription;
  let text = tempDiv.textContent || tempDiv.innerText || '';
  text = text.trim();

  // Filter out wger's automated importer placeholder text
  if (text.toLowerCase().includes("custom description created by")) {
    return React.createElement(
      'p',
      { className: 'no-desc' },
      'No detailed instructions available from API for this movement.'
    );
  }

  // If the API provided true structured HTML lists, preserve them
  if (rawDescription.includes('<ul>') || rawDescription.includes('<ol>') || rawDescription.includes('<li>')) {
    return React.createElement('div', {
      className: 'exercise-html-content',
      dangerouslySetInnerHTML: { __html: rawDescription }
    });
  }

  // Remove Wikipedia-style citation tags like [1], [2], etc.
  text = text.replace(/\[\d+\]/g, '');

  // Strip out existing manual hyphens or bullet symbols
  let cleanedText = text
    .split(/\n/)
    .map(line => line.replace(/^[-–—*\u2022]\s*/, '').trim())
    .filter(line => line.length > 0)
    .join(' ');

  // Split into sentences and capitalize each one
  let sentences = cleanedText
    .split(/(?<=[.!?])(?:\]|\)|\")?\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1));

  if (sentences.length > 0) {
    return React.createElement(
      'ul',
      { className: 'normalized-instruction-list' },
      sentences.map((sentence, index) =>
        React.createElement('li', { key: index }, sentence)
      )
    );
  }

  return React.createElement(
    'div',
    { className: 'normalized-instruction-text' },
    React.createElement('p', null, text)
  );
}