import { createException } from '~/utils/createException';
import { ResponseCode } from '~/utils';

export const InvalidRefreshTokenException = () =>
    createException(
        'InvalidRefreshTokenException',
        'Invalid refresh token.',
        ResponseCode.UNAUTHORIZED,
    );
