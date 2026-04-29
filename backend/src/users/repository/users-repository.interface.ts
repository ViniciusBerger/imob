export const USERS_REPOSITORY = 'USERS_REPOSITORY';

export type UserRecord = {
    id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    resetToken?: string | null;
    resetTokenExpiry?: Date | null;
    createdAt?: Date;
};

export type UserListItem = {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
};

export type CreateUserRecordData = {
    name: string;
    email: string;
    password: string;
    role?: string;
    tenantId?: string | null;
};

export type UpdateUserRecordData = {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    tenantId?: string | null;
};

export interface IUsersRepository {
    findByEmail(email: string): Promise<UserRecord | null>;
    findById(id: string): Promise<UserRecord | null>;
    findAll(): Promise<UserListItem[]>;
    create(data: CreateUserRecordData): Promise<UserRecord>;
    updateById(id: string, data: UpdateUserRecordData): Promise<UserRecord>;
    updateResetToken(email: string, token: string | null, expiry: Date | null): Promise<UserRecord>;
    findValidByResetToken(token: string): Promise<UserRecord | null>;
    updatePasswordAndClearResetToken(id: string, hashedPassword: string): Promise<UserRecord>;
}