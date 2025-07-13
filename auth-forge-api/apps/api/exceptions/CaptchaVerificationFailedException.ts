import { createException } from '~/utils/createException';
import { ResponseCode } from '~/utils';

export const CaptchaVerificationFailedException = () =>
    createException(
        'CaptchaVerificationFailedException',
        `CAPTCHA verification failed.`,
        ResponseCode.CONFLICT,
    );
