import axios from 'axios';
import { CAPTCHA_SECRET } from '~/utils';
import { CaptchaVerificationFailedException } from '~/exceptions/CaptchaVerificationFailedException';

export class CaptchaService {
    static async verify(token: string): Promise<{ success: boolean; score?: number }> {
        const { data } = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
            params: {
                secret: CAPTCHA_SECRET,
                response: token,
            },
        });

        if (!data.success) {
            throw CaptchaVerificationFailedException();
        }

        return {
            success: true,
            score: data.score,
        };
    }
}
