const fs = require('fs');

function renderEmailTemplate(templatePath, variables) {
  let html = fs.readFileSync(templatePath, 'utf8');
  for (const key in variables) {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), variables[key]);
  }
  return html;
}

module.exports = renderEmailTemplate;
