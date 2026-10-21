
export interface Profile {
    id?: number | string;
    first_name?: string;
    last_name?: string;
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    profile_image?: string;
    [key: string]: unknown;
}

export interface Address {
    id: number | string;
    full_name: string;
    phone: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    address_type: "HOME" | "OFFICE" | string;
    is_default: boolean;
}

export interface Order {
    id: number | string;
    order_number: string;
    created_at: string;
    status: "PAID" | "PENDING" | "CANCELLED" | string;
    total: number | string;
}
