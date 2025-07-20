import { createException } from '~/utils/createException';
import { ResponseCode } from '~/utils';

export const UserMustHaveAtLeastOneRoleException = (userId: string) =>
    createException(
        'UserMustHaveAtLeastOneRoleException',
        `User with id ${userId} must have at least one role.`,
        ResponseCode.CONFLICT,
    );
