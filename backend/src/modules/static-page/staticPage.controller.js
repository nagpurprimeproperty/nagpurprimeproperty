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

  // Convert paragraphs that look like headings to <h3>
  cleanHtml = cleanHtml.replace(/<p([^>]*)>([\s\S]*?)<\/p>/gi, (match, attrs, content) => {
    const plainText = content.replace(/<[^>]+>/g, '').trim();
    // Pattern 1: "1. Introduction" or "15. Grievance Redressal"
    // Pattern 2: "A. Information You Provide"
    const isHeadingPattern = /^\d+\.\s+[A-Z]/i.test(plainText) || /^[A-Z]\.\s+[A-Z]/i.test(plainText);
    
    if (isHeadingPattern) {
      return `<h3>${plainText}</h3>`;
    }
    return `<p${attrs}>${content}</p>`;
  });

  return `<h2>${title}</h2>\n${cleanHtml}`;
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