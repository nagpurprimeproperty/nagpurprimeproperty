// staticPage.controller.js
import staticPageService from './staticPage.service.js';

function formatHtmlForMobile(html, title) {
  if (!html) return '';
  let cleanHtml = html.trim();
  
  // Strip Microsoft Word junk tags
  cleanHtml = cleanHtml.replace(/<o:p>.*?<\/o:p>/gi, '');
  cleanHtml = cleanHtml.replace(/<\/o:p>/gi, '');
  
  // Replace matched h1-h6 blocks with standard paragraphs
  cleanHtml = cleanHtml.replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, '<p>$1</p>');
  
  // Remove any stray unclosed h1-h6 tags
  cleanHtml = cleanHtml.replace(/<\/?h[1-6][^>]*>/gi, '');

  // Convert list items <li> to paragraphs with bullet points
  cleanHtml = cleanHtml.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (match, content) => {
    const trimmed = content.trim();
    if (/^[•\-\d*]/i.test(trimmed)) {
      return `<p>${content}</p>`;
    }
    return `<p>• ${content}</p>`;
  });
  
  // Remove <ul>, <ol>, </ul>, </ol>
  cleanHtml = cleanHtml.replace(/<\/?(ul|ol)[^>]*>/gi, '');

  // Parse all <p> paragraphs.
  let finalHtml = '';
  const pRegex = /<p([^>]*)>([\s\S]*?)<\/p>/gi;
  let match;
  
  while ((match = pRegex.exec(cleanHtml)) !== null) {
    const attrs = match[1];
    const content = match[2];
    
    // We split lines
    const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    
    if (lines.length > 1) {
      // It has multiple lines inside the paragraph. Let's separate the heading and the body
      let headingText = lines[0];
      let bodyStartIndex = 1;
      
      const secondLinePlain = lines[1].replace(/<[^>]+>/g, '').trim();
      
      if (
        lines[1] &&
        secondLinePlain.length < 35 && 
        !/^[A-Z]\.\s+/i.test(secondLinePlain) &&
        !/^[•\-\d*]/i.test(secondLinePlain) &&
        !/^(These|The|By|To|Registration|All|Users|Buyers|False|Company|Governed|Grievance|Listing|Lead|Payments|RERA)/i.test(secondLinePlain)
      ) {
        headingText += ' ' + lines[1];
        bodyStartIndex = 2;
      }
      
      const headingPlain = headingText.replace(/<[^>]+>/g, '').trim();
      const isHeadingPattern = /^\d+\.\s+[A-Z]/i.test(headingPlain) || /^[A-Z]\.\s+[A-Z]/i.test(headingPlain);
      
      if (isHeadingPattern) {
        finalHtml += `<h3>${headingPlain}</h3>\n`;
      } else {
        finalHtml += `<p${attrs}>${headingText}</p>\n`;
      }
      
      // Append the rest as normal paragraphs
      for (let i = bodyStartIndex; i < lines.length; i++) {
        const lineContent = lines[i];
        const linePlain = lineContent.replace(/<[^>]+>/g, '').trim();
        const isLineHeadingPattern = /^\d+\.\s+[A-Z]/i.test(linePlain) || /^[A-Z]\.\s+[A-Z]/i.test(linePlain);
        
        if (isLineHeadingPattern) {
          finalHtml += `<h3>${linePlain}</h3>\n`;
        } else {
          finalHtml += `<p>${lineContent}</p>\n`;
        }
      }
    } else {
      // Single line paragraph
      const plainText = content.replace(/<[^>]+>/g, '').trim();
      const isHeadingPattern = /^\d+\.\s+[A-Z]/i.test(plainText) || /^[A-Z]\.\s+[A-Z]/i.test(plainText);
      if (isHeadingPattern) {
        finalHtml += `<h3>${plainText}</h3>\n`;
      } else {
        finalHtml += `<p${attrs}>${content}</p>\n`;
      }
    }
  }

  if (finalHtml === '') {
    finalHtml = cleanHtml;
  }

  return `<h2>${title}</h2>\n${finalHtml}`;
}

const staticPageController = {
  getPage: async (req, res) => {
    try {
      const page = await staticPageService.getPage(req.params.slug);
      
      if (page && (page.slug === 'privacy-policy' || page.slug === 'terms-and-conditions')) {
        page.content = formatHtmlForMobile(page.content, page.title);
      }
      
      res.status(200).json({ success: true, data: page });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },
};

export default staticPageController;