
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
    UserRound,
    Pencil,
    MapPin,
    ShoppingBag,
    Camera,
    LoaderCircle,
    Save,
    LockKeyhole,
    Plus,
    Trash2,
    Star,
    X,
    ArrowRight,
    Package,
} from "lucide-react";

import { apiGet, apiPost, apiPut, apiDelete, API_BASE_URL } from "../api/api";
import type { Profile, Address, Order } from "../api/profile";


type Section = "profile" | "edit" | "addresses" | "orders";

const defaultAddress: Omit<Address, "id"> = {
    full_name: "",
    phone: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    country: "India",
    postal_code: "",
    address_type: "HOME",
    is_default: false,
};

function getImageUrl(image?: string) {
    if (!image) return "";

    if (image.startsWith("http://") || image.startsWith("https://")) {
        return image;
    }

    const serverUrl = API_BASE_URL.replace(/\/api\/?$/, "");

    return `${serverUrl}${image.startsWith("/") ? "" : "/"}${image}`;
}

function getErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
}

function ProfilePage() {
    const [section, setSection] = useState<Section>("profile");

    const [profile, setProfile] = useState<Profile | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileSaving, setProfileSaving] = useState(false);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [addressText, setAddressText] = useState("");
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState("");

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordSaving, setPasswordSaving] = useState(false);

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [addressesLoading, setAddressesLoading] = useState(false);
    const [addressSaving, setAddressSaving] = useState(false);
    const [addressFormOpen, setAddressFormOpen] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<string | number | null>(null);
    const [addressForm, setAddressForm] = useState(defaultAddress);

    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("access_token") ??
            localStorage.getItem("token")
            : null;

    async function loadProfile() {
        try {
            const response = await apiGet<unknown>("auth/profile/");
            const result = response as {
                success?: boolean;
                message?: string;
                data?: Profile;
            };

            if (result?.success === false) {
                throw new Error(result.message || "Unable to load profile.");
            }

            const data =
                result && typeof result === "object" && "data" in result
                    ? result.data
                    : (response as Profile);

            if (!data || typeof data !== "object") {
                throw new Error(result?.message || "Unable to load profile.");
            }

            setProfile(data);
            setFirstName(data.first_name ?? "");
            setLastName(data.last_name ?? "");
            setPhone(data.phone ?? "");
            setAddressText(data.address ?? "");
            setImagePreview(getImageUrl(data.profile_image));
        } catch (err) {
            setError(getErrorMessage(err, "Unable to load your profile."));
        } finally {
            setProfileLoading(false);
        }
    }

    async function loadAddresses() {
        setAddressesLoading(true);
        setError("");

        try {
            const response = await apiGet<unknown>("addresses/");
            const result = response as {
                data?: Address[];
                results?: Address[];
            };

            const list = Array.isArray(response)
                ? response
                : Array.isArray(result?.results)
                    ? result.results
                    : Array.isArray(result?.data)
                        ? result.data
                        : [];

            setAddresses(list as Address[]);
        } catch (err) {
            setError(getErrorMessage(err, "Unable to load addresses."));
        } finally {
            setAddressesLoading(false);
        }
    }

    async function loadOrders() {
        setOrdersLoading(true);
        setError("");

        try {
            const response = await apiGet<unknown>("orders/");
            const result = response as {
                data?: Order[];
                results?: Order[];
            };

            const list = Array.isArray(response)
                ? response
                : Array.isArray(result?.results)
                    ? result.results
                    : Array.isArray(result?.data)
                        ? result.data
                        : [];

            setOrders(list as Order[]);
        } catch (err) {
            setError(getErrorMessage(err, "Unable to load orders."));
        } finally {
            setOrdersLoading(false);
        }
    }

    useEffect(() => {
        if (!token) return;

        const timer = Promise.resolve().then(() => loadProfile());
        void timer;

        // Load profile once on mount.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        return () => {
            if (imagePreview.startsWith("blob:")) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    function changeSection(nextSection: Section) {
        setSection(nextSection);
        setError("");
        setSuccess("");

        if (nextSection === "addresses") void loadAddresses();
        if (nextSection === "orders") void loadOrders();

        if (nextSection === "edit" && profile) {
            setFirstName(profile.first_name ?? "");
            setLastName(profile.last_name ?? "");
            setPhone(profile.phone ?? "");
            setAddressText(profile.address ?? "");
            setProfileImage(null);
        }
    }

    async function handleUpdateProfile(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!firstName.trim() || !lastName.trim()) {
            setError("Please enter your first and last name.");
            return;
        }

        setProfileSaving(true);
        setError("");
        setSuccess("");

        try {
            const formData = new FormData();

            formData.append("first_name", firstName.trim());
            formData.append("last_name", lastName.trim());
            formData.append("phone", phone.trim());
            formData.append("address", addressText.trim());

            if (profileImage) {
                formData.append("profile_image", profileImage);
            }

            const result = await apiPut<unknown>("auth/profile/", formData);
            const response = result as { success?: boolean; message?: string };

            if (response?.success === false) {
                throw new Error(response.message || "Profile update failed.");
            }

            await loadProfile();
            setProfileImage(null);
            setSection("profile");
            setSuccess("Your profile was updated successfully.");
        } catch (err) {
            setError(getErrorMessage(err, "Unable to update your profile."));
        } finally {
            setProfileSaving(false);
        }
    }

    async function handleChangePassword(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (!oldPassword || !newPassword || !confirmPassword) {
            setError("Please fill in all password fields.");
            return;
        }

        if (newPassword.length < 8) {
            setError("Your new password must contain at least 8 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New password and confirmation do not match.");
            return;
        }

        setPasswordSaving(true);

        try {
            const result = await apiPost<unknown>("auth/change-password/", {
                old_password: oldPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
            });

            const response = result as { success?: boolean; message?: string };

            if (response?.success === false) {
                throw new Error(response.message || "Unable to change password.");
            }

            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setSuccess("Your password was changed successfully.");
        } catch (err) {
            setError(getErrorMessage(err, "Unable to change your password."));
        } finally {
            setPasswordSaving(false);
        }
    }

    function startAddAddress() {
        setEditingAddressId(null);
        setAddressForm({ ...defaultAddress });
        setAddressFormOpen(true);
        setError("");
        setSuccess("");
    }

    function startEditAddress(item: Address) {
        setEditingAddressId(item.id);
        setAddressForm({
            full_name: item.full_name ?? "",
            phone: item.phone ?? "",
            address_line_1: item.address_line_1 ?? "",
            address_line_2: item.address_line_2 ?? "",
            city: item.city ?? "",
            state: item.state ?? "",
            country: item.country ?? "India",
            postal_code: item.postal_code ?? "",
            address_type: item.address_type ?? "HOME",
            is_default: Boolean(item.is_default),
        });
        setAddressFormOpen(true);
        setError("");
        setSuccess("");
    }

    async function handleSaveAddress(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setAddressSaving(true);
        setError("");
        setSuccess("");

        try {
            const result = editingAddressId
                ? await apiPut<unknown>(
                    `addresses/${editingAddressId}/`,
                    addressForm
                )
                : await apiPost<unknown>("addresses/", addressForm);

            const response = result as { success?: boolean; message?: string };

            if (response?.success === false) {
                throw new Error(response.message || "Unable to save address.");
            }

            setAddressFormOpen(false);
            setEditingAddressId(null);
            setSuccess("Address saved successfully.");
            await loadAddresses();
        } catch (err) {
            setError(getErrorMessage(err, "Unable to save address."));
        } finally {
            setAddressSaving(false);
        }
    }

    async function handleDeleteAddress(id: string | number) {
        if (!window.confirm("Are you sure you want to delete this address?")) {
            return;
        }

        setError("");
        setSuccess("");

        try {
            await apiDelete(`addresses/${id}/`);
            setSuccess("Address deleted successfully.");
            await loadAddresses();
        } catch (err) {
            setError(getErrorMessage(err, "Unable to delete address."));
        }
    }

    async function handleSetDefault(id: string | number) {
        setError("");
        setSuccess("");

        try {
            await apiPost(`addresses/${id}/set-default/`, {});
            setSuccess("Default address updated.");
            await loadAddresses();
        } catch (err) {
            setError(getErrorMessage(err, "Unable to update default address."));
        }
    }

    if (!token) {
        return (
            <section className="container mx-auto px-4 py-16">
                <div className="mx-auto max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                    <UserRound className="mx-auto mb-4 h-12 w-12 text-orange-600" />
                    <h1 className="text-2xl font-bold text-gray-900">
                        Login Required
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Please log in to access your profile, addresses and orders.
                    </p>
                    <Link
                        to="/"
                        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700"
                    >
                        Go to Home <ArrowRight size={18} />
                    </Link>
                </div>
            </section>
        );
    }

    const fullName =
        `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim() ||
        profile?.name ||
        "Member";

    const menuItems: {
        id: Section;
        label: string;
        icon: typeof UserRound;
    }[] = [
            { id: "profile", label: "My Profile", icon: UserRound },
            { id: "edit", label: "Edit Profile", icon: Pencil },
            { id: "addresses", label: "Addresses", icon: MapPin },
            { id: "orders", label: "My Orders", icon: ShoppingBag },
        ];

    const inputClass =
        "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100";

    const labelClass = "mb-1.5 block text-sm font-semibold text-gray-700";

    return (
        <section className="container mx-auto min-h-[60vh] px-4 py-8 md:py-12">
            <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
                    My Account
                </p>
                <h1 className="mt-1 text-3xl font-bold text-gray-900 md:text-4xl">
                    Profile Information
                </h1>
                <p className="mt-2 text-gray-600">
                    Manage your personal information, addresses and orders.
                </p>
            </div>

            {error && (
                <div
                    role="alert"
                    className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700"
                >
                    <span>{error}</span>
                    <button
                        type="button"
                        aria-label="Dismiss error"
                        onClick={() => setError("")}
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {success && (
                <div
                    role="status"
                    className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
                >
                    <span>{success}</span>
                    <button
                        type="button"
                        aria-label="Dismiss message"
                        onClick={() => setSuccess("")}
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                <aside className="lg:col-span-3">
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-5 py-4">
                            <h2 className="font-bold text-gray-900">
                                Account Menu
                            </h2>
                        </div>

                        <nav className="p-2">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const active = section === item.id;

                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => changeSection(item.id)}
                                        className={`mb-1 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${active
                                            ? "bg-orange-600 text-white shadow-sm"
                                            : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                                            }`}
                                    >
                                        <Icon size={19} />
                                        {item.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                <main className="min-w-0 lg:col-span-9">
                    {section === "profile" && (
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="bg-orange-600 px-5 py-4 text-white md:px-7">
                                <h2 className="text-xl font-bold">My Profile</h2>
                                <p className="mt-1 text-sm text-orange-100">
                                    Your personal account information
                                </p>
                            </div>

                            {profileLoading ? (
                                <div className="flex min-h-64 items-center justify-center gap-3 text-gray-500">
                                    <LoaderCircle className="animate-spin text-orange-600" />
                                    Loading profile...
                                </div>
                            ) : (
                                <div className="p-5 md:p-7">
                                    <div className="mb-8 flex flex-col items-center gap-5 rounded-xl bg-gray-50 p-5 sm:flex-row">
                                        <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-orange-100 shadow">
                                            {imagePreview ? (
                                                <img
                                                    src={imagePreview}
                                                    alt={fullName}
                                                    className="h-full w-full object-cover"
                                                    onError={() => setImagePreview("")}
                                                />
                                            ) : (
                                                <UserRound
                                                    size={48}
                                                    className="text-orange-600"
                                                />
                                            )}
                                        </div>

                                        <div className="text-center sm:text-left">
                                            <h3 className="text-2xl font-bold text-gray-900">
                                                {fullName}
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Member
                                            </p>
                                            <p className="mt-2 break-all text-sm text-gray-600">
                                                {profile?.email || "No email available"}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => changeSection("edit")}
                                            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 sm:ml-auto"
                                        >
                                            <Pencil size={16} /> Edit Profile
                                        </button>
                                    </div>

                                    <h3 className="mb-5 text-lg font-bold text-gray-900">
                                        Personal Details
                                    </h3>

                                    <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                                        {[
                                            ["First Name", profile?.first_name],
                                            ["Last Name", profile?.last_name],
                                            ["Email Address", profile?.email],
                                            ["Phone Number", profile?.phone],
                                            ["Address", profile?.address],
                                        ].map(([label, value]) => (
                                            <div key={label}>
                                                <p className="text-sm font-semibold text-gray-500">
                                                    {label}
                                                </p>
                                                <p className="mt-1 break-words font-medium text-gray-900">
                                                    {value || "—"}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {section === "edit" && (
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="bg-orange-600 px-5 py-4 text-white md:px-7">
                                <h2 className="text-xl font-bold">Edit Profile</h2>
                            </div>

                            <form
                                onSubmit={handleUpdateProfile}
                                className="p-5 md:p-7"
                            >
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <div>
                                        <label className={labelClass}>
                                            First Name *
                                        </label>
                                        <input
                                            className={inputClass}
                                            value={firstName}
                                            onChange={(e) =>
                                                setFirstName(e.target.value)
                                            }
                                            required
                                            autoComplete="given-name"
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>
                                            Last Name *
                                        </label>
                                        <input
                                            className={inputClass}
                                            value={lastName}
                                            onChange={(e) =>
                                                setLastName(e.target.value)
                                            }
                                            required
                                            autoComplete="family-name"
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Email</label>
                                        <input
                                            className={`${inputClass} cursor-not-allowed bg-gray-100`}
                                            type="email"
                                            value={profile?.email ?? ""}
                                            readOnly
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Phone</label>
                                        <input
                                            className={inputClass}
                                            type="tel"
                                            value={phone}
                                            onChange={(e) =>
                                                setPhone(e.target.value)
                                            }
                                            autoComplete="tel"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>
                                            Address
                                        </label>
                                        <textarea
                                            className={inputClass}
                                            rows={3}
                                            value={addressText}
                                            onChange={(e) =>
                                                setAddressText(e.target.value)
                                            }
                                            autoComplete="street-address"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>
                                            Profile Image
                                        </label>

                                        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                                            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50">
                                                {imagePreview ? (
                                                    <img
                                                        src={imagePreview}
                                                        alt="Profile preview"
                                                        className="h-full w-full object-cover"
                                                        onError={() =>
                                                            setImagePreview("")
                                                        }
                                                    />
                                                ) : (
                                                    <UserRound
                                                        size={36}
                                                        className="text-gray-400"
                                                    />
                                                )}
                                            </div>

                                            <label className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-orange-500 hover:text-orange-600 sm:w-auto">
                                                <Camera size={18} />
                                                Choose Image
                                                <input
                                                    type="file"
                                                    className="sr-only"
                                                    accept="image/png,image/jpeg,image/jpg"
                                                    onChange={(e) => {
                                                        const file =
                                                            e.target.files?.[0];

                                                        if (!file) return;

                                                        if (
                                                            !file.type.startsWith(
                                                                "image/"
                                                            )
                                                        ) {
                                                            setError(
                                                                "Please choose an image file."
                                                            );
                                                            e.target.value = "";
                                                            return;
                                                        }

                                                        if (
                                                            file.size >
                                                            5 * 1024 * 1024
                                                        ) {
                                                            setError(
                                                                "Image size must not exceed 5 MB."
                                                            );
                                                            e.target.value = "";
                                                            return;
                                                        }

                                                        setError("");
                                                        setImagePreview(URL.createObjectURL(file));
                                                        setProfileImage(file);
                                                    }}
                                                />
                                            </label>

                                            <p className="text-xs text-gray-500">
                                                JPG or PNG, maximum 5 MB.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-7 flex flex-wrap gap-3">
                                    <button
                                        type="submit"
                                        disabled={profileSaving}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {profileSaving ? (
                                            <LoaderCircle
                                                size={18}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <Save size={18} />
                                        )}
                                        {profileSaving
                                            ? "Saving..."
                                            : "Update Profile"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => changeSection("profile")}
                                        className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>

                            <div className="border-t border-gray-200 p-5 md:p-7">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="rounded-lg bg-orange-50 p-2 text-orange-600">
                                        <LockKeyhole size={21} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            Change Password
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Choose a strong, new password.
                                        </p>
                                    </div>
                                </div>

                                <form
                                    onSubmit={handleChangePassword}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label className={labelClass}>
                                            Current Password
                                        </label>
                                        <input
                                            className={inputClass}
                                            type="password"
                                            value={oldPassword}
                                            onChange={(e) =>
                                                setOldPassword(e.target.value)
                                            }
                                            autoComplete="current-password"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className={labelClass}>
                                                New Password
                                            </label>
                                            <input
                                                className={inputClass}
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) =>
                                                    setNewPassword(
                                                        e.target.value
                                                    )
                                                }
                                                autoComplete="new-password"
                                                minLength={8}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className={labelClass}>
                                                Confirm New Password
                                            </label>
                                            <input
                                                className={inputClass}
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) =>
                                                    setConfirmPassword(
                                                        e.target.value
                                                    )
                                                }
                                                autoComplete="new-password"
                                                minLength={8}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={passwordSaving}
                                        className="inline-flex items-center gap-2 rounded-lg border border-orange-600 px-5 py-2.5 font-semibold text-orange-600 transition hover:bg-orange-50 disabled:opacity-60"
                                    >
                                        {passwordSaving && (
                                            <LoaderCircle
                                                size={17}
                                                className="animate-spin"
                                            />
                                        )}
                                        Change Password
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {section === "addresses" && (
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-3 bg-orange-600 px-5 py-4 text-white md:px-7">
                                <div>
                                    <h2 className="text-xl font-bold">
                                        My Addresses
                                    </h2>
                                    <p className="mt-1 text-sm text-orange-100">
                                        Manage your delivery addresses.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        addressFormOpen
                                            ? setAddressFormOpen(false)
                                            : startAddAddress()
                                    }
                                    className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
                                >
                                    {addressFormOpen ? (
                                        <X size={17} />
                                    ) : (
                                        <Plus size={17} />
                                    )}
                                    {addressFormOpen ? "Close" : "Add Address"}
                                </button>
                            </div>

                            {addressFormOpen && (
                                <form
                                    onSubmit={handleSaveAddress}
                                    className="border-b border-gray-200 bg-gray-50 p-5 md:p-7"
                                >
                                    <h3 className="mb-5 text-lg font-bold text-gray-900">
                                        {editingAddressId
                                            ? "Edit Address"
                                            : "Add New Address"}
                                    </h3>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        {(
                                            [
                                                ["full_name", "Full Name"],
                                                ["phone", "Phone"],
                                                [
                                                    "address_line_1",
                                                    "Address Line 1",
                                                ],
                                                [
                                                    "address_line_2",
                                                    "Address Line 2",
                                                ],
                                                ["city", "City"],
                                                ["state", "State"],
                                                ["country", "Country"],
                                                ["postal_code", "Postal Code"],
                                            ] as const
                                        ).map(([key, label]) => (
                                            <div key={key}>
                                                <label className={labelClass}>
                                                    {label}
                                                </label>
                                                <input
                                                    className={inputClass}
                                                    value={addressForm[key] ?? ""}
                                                    onChange={(e) =>
                                                        setAddressForm(
                                                            (previous) => ({
                                                                ...previous,
                                                                [key]: e.target.value,
                                                            })
                                                        )
                                                    }
                                                    required={
                                                        key !== "address_line_2"
                                                    }
                                                />
                                            </div>
                                        ))}

                                        <div>
                                            <label className={labelClass}>
                                                Address Type
                                            </label>
                                            <select
                                                className={inputClass}
                                                value={addressForm.address_type}
                                                onChange={(e) =>
                                                    setAddressForm(
                                                        (previous) => ({
                                                            ...previous,
                                                            address_type:
                                                                e.target.value,
                                                        })
                                                    )
                                                }
                                            >
                                                <option value="HOME">Home</option>
                                                <option value="OFFICE">
                                                    Office
                                                </option>
                                            </select>
                                        </div>

                                        <label className="flex cursor-pointer items-center gap-3 self-center text-sm font-medium text-gray-700">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 accent-orange-600"
                                                checked={
                                                    addressForm.is_default
                                                }
                                                onChange={(e) =>
                                                    setAddressForm(
                                                        (previous) => ({
                                                            ...previous,
                                                            is_default:
                                                                e.target.checked,
                                                        })
                                                    )
                                                }
                                            />
                                            Set as default address
                                        </label>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={addressSaving}
                                        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:opacity-60"
                                    >
                                        {addressSaving && (
                                            <LoaderCircle
                                                size={17}
                                                className="animate-spin"
                                            />
                                        )}
                                        Save Address
                                    </button>
                                </form>
                            )}

                            <div className="space-y-4 p-5 md:p-7">
                                {addressesLoading ? (
                                    <div className="flex justify-center gap-3 py-12 text-gray-500">
                                        <LoaderCircle className="animate-spin text-orange-600" />
                                        Loading addresses...
                                    </div>
                                ) : addresses.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <MapPin
                                            size={42}
                                            className="mx-auto mb-3 text-gray-300"
                                        />
                                        <h3 className="font-semibold text-gray-800">
                                            No addresses found
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Add an address for your deliveries.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={startAddAddress}
                                            className="mt-4 rounded-lg bg-orange-600 px-4 py-2.5 font-semibold text-white hover:bg-orange-700"
                                        >
                                            Add Address
                                        </button>
                                    </div>
                                ) : (
                                    addresses.map((item) => (
                                        <article
                                            key={item.id}
                                            className="rounded-xl border border-gray-200 p-4 transition hover:border-orange-200 md:p-5"
                                        >
                                            <div className="flex flex-col justify-between gap-4 sm:flex-row">
                                                <div className="min-w-0">
                                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                                        <MapPin
                                                            size={18}
                                                            className="text-orange-600"
                                                        />
                                                        <h3 className="font-bold text-gray-900">
                                                            {item.full_name}
                                                        </h3>
                                                        <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
                                                            {item.address_type}
                                                        </span>
                                                        {item.is_default && (
                                                            <span className="rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="break-words text-sm leading-6 text-gray-600">
                                                        {item.address_line_1}
                                                        {item.address_line_2
                                                            ? `, ${item.address_line_2}`
                                                            : ""}
                                                        <br />
                                                        {item.city}, {item.state}
                                                        <br />
                                                        {item.country} -{" "}
                                                        {item.postal_code}
                                                    </p>
                                                    <p className="mt-2 text-sm text-gray-600">
                                                        Phone: {item.phone}
                                                    </p>
                                                </div>

                                                <div className="flex shrink-0 flex-wrap items-start gap-2 sm:flex-col">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            startEditAddress(item)
                                                        }
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:border-orange-500 hover:text-orange-600"
                                                    >
                                                        <Pencil size={15} /> Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            void handleDeleteAddress(
                                                                item.id
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 px-3 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50"
                                                    >
                                                        <Trash2 size={15} /> Delete
                                                    </button>

                                                    {!item.is_default && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                void handleSetDefault(
                                                                    item.id
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50"
                                                        >
                                                            <Star size={15} />
                                                            Make Default
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </article>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {section === "orders" && (
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="bg-orange-600 px-5 py-4 text-white md:px-7">
                                <h2 className="text-xl font-bold">My Orders</h2>
                                <p className="mt-1 text-sm text-orange-100">
                                    View your purchase history and order status.
                                </p>
                            </div>

                            {ordersLoading ? (
                                <div className="flex min-h-64 items-center justify-center gap-3 text-gray-500">
                                    <LoaderCircle className="animate-spin text-orange-600" />
                                    Loading orders...
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="px-5 py-14 text-center">
                                    <Package
                                        size={46}
                                        className="mx-auto mb-3 text-gray-300"
                                    />
                                    <h3 className="font-bold text-gray-900">
                                        No orders found
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Your orders will appear here after you make a purchase.
                                    </p>
                                    <Link
                                        to="/shop"
                                        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700"
                                    >
                                        Explore Store <ArrowRight size={17} />
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-4 p-4 md:hidden">
                                        {orders.map((order) => (
                                            <article
                                                key={order.id}
                                                className="rounded-xl border border-gray-200 p-4"
                                            >
                                                <div className="flex justify-between gap-3">
                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            Order ID
                                                        </p>
                                                        <p className="mt-1 font-bold text-gray-900">
                                                            {order.order_number}
                                                        </p>
                                                    </div>
                                                    <OrderStatus
                                                        status={order.status}
                                                    />
                                                </div>
                                                <p className="mt-3 text-sm text-gray-500">
                                                    {order.created_at
                                                        ? new Date(
                                                            order.created_at
                                                        ).toLocaleDateString(
                                                            "en-IN"
                                                        )
                                                        : "—"}
                                                </p>
                                                <p className="mt-3 text-lg font-bold text-gray-900">
                                                    ₹
                                                    {Number(
                                                        order.total
                                                    ).toLocaleString("en-IN")}
                                                </p>
                                                <Link
                                                    to={`/order-success?order_id=${order.id}`}
                                                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700"
                                                >
                                                    View Details{" "}
                                                    <ArrowRight size={16} />
                                                </Link>
                                            </article>
                                        ))}
                                    </div>

                                    <div className="hidden overflow-x-auto md:block">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                                <tr>
                                                    <th className="px-5 py-4">
                                                        Order ID
                                                    </th>
                                                    <th className="px-5 py-4">
                                                        Date
                                                    </th>
                                                    <th className="px-5 py-4">
                                                        Status
                                                    </th>
                                                    <th className="px-5 py-4">
                                                        Total
                                                    </th>
                                                    <th className="px-5 py-4">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {orders.map((order) => (
                                                    <tr
                                                        key={order.id}
                                                        className="transition hover:bg-orange-50/40"
                                                    >
                                                        <td className="px-5 py-4 font-semibold text-gray-900">
                                                            {order.order_number}
                                                        </td>
                                                        <td className="px-5 py-4 text-gray-600">
                                                            {order.created_at
                                                                ? new Date(
                                                                    order.created_at
                                                                ).toLocaleDateString(
                                                                    "en-IN"
                                                                )
                                                                : "—"}
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <OrderStatus
                                                                status={
                                                                    order.status
                                                                }
                                                            />
                                                        </td>
                                                        <td className="px-5 py-4 font-semibold text-gray-900">
                                                            ₹
                                                            {Number(
                                                                order.total
                                                            ).toLocaleString(
                                                                "en-IN"
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <Link
                                                                to={`/order-success?order_id=${order.id}`}
                                                                className="inline-flex items-center gap-1.5 font-semibold text-orange-600 transition hover:text-orange-700"
                                                            >
                                                                View Details
                                                                <ArrowRight
                                                                    size={15}
                                                                />
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </section>
    );
}

function OrderStatus({ status }: { status: string }) {
    const styles: Record<string, string> = {
        PAID: "bg-green-50 text-green-700",
        PENDING: "bg-amber-50 text-amber-700",
        CANCELLED: "bg-red-50 text-red-700",
    };

    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${styles[status] ?? "bg-gray-100 text-gray-600"
                }`}
        >
            {status}
        </span>
    );
}

export default ProfilePage;
