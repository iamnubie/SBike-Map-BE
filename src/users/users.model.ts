import { Schema, Document } from 'mongoose';

const UserSchema = new Schema(
    {
        username: { type: String, required: true },
        password: { type: String, required: false },
        email: { type: String, required: true, unique: true },
        refreshToken: { type: String, required: false },
        firebase_uid: { type: String, required: false, unique: true },
        avatarUrl: { type: String, required: false },
    },
    {
        timestamps: true,
        collection: 'users'
    }
);

export {UserSchema};

export interface User extends Document {
    username: string;
    password?: string;
    email: string;
    refreshToken?: string;
    firebase_uid?: string;
    avatarUrl?: string;
}