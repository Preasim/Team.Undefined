export interface UserInfo {
    memberId: number;
    name: string;
    email: string;
    image: string;
    state: string;
    createdAt: string;
    modifiedAt: string;
}

export interface UserInfoResponse {
    data: UserInfo[];
}
