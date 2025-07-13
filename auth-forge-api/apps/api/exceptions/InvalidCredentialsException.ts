import { createException } from '~/utils/createException';
import { ResponseCode } from '~/utils';

export const InvalidCredentialsException = () =>
    createException(
        'InvalidCredentialsException',
        'Invalid credentials.',
        ResponseCode.UNAUTHORIZED,
    );
