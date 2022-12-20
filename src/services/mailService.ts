import mail from 'config/mail';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

class MailService {
  private defaultMailOptions = {
    from: mail.mailUser,
    to: mail.mailUser,
  };
  public sendEmail = async (mailOptions: Mail.Options) => {
    const transporter = nodemailer.createTransport({
      host: mail.mailHost,
      port: mail.mailPort,
      secure: true,
      auth: {
        user: mail.mailUser,
        pass: mail.mailPassword,
      },
    });

    try {
      const result = await transporter.sendMail({
        ...this.defaultMailOptions,
        ...mailOptions,
      });
      return result;
    } catch (err) {
      console.log({ err });
    }
  };
}

export default MailService;
