export default {
  mailHost: process.env.MAIL_HOST as string,
  mailPassword: process.env.MAIL_PASSWORD as string,
  mailUser: process.env.MAIL_USER as string,
  mailPort: parseInt(process.env.MAIL_PORT),
};
