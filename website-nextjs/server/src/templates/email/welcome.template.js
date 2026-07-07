export const welcomeTemplate = (name) => ({
  subject: 'Welcome!',
  html: `
    <h2>Welcome, ${name}!</h2>
    <p>Glad to have you onboard.</p>
  `,
});