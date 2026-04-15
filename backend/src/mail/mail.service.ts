import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async sendPasswordReset(email: string, token: string) {
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

        await this.transporter.sendMail({
            from: '"eSolu - Imóveis" <suporte@esolu.com.br>',
            to: email,
            subject: 'Recuperação de Senha',
            html: `
                <h3>Recuperação de Senha</h3>
                <p>Você solicitou a recuperação de senha.</p>
                <p>Clique no link abaixo para redefinir sua senha:</p>
                <a href="${resetLink}">${resetLink}</a>
                <p>Se você não solicitou isso, ignore este email.</p>
            `,
        });
    }
}
