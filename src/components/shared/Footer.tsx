
import { Link } from "react-router-dom";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-950 text-gray-300">
            {/* Main footer */}
            <div className="mx-auto max-w-[1440px] px-5 pb-10 pt-14 sm:px-8 sm:pt-16 lg:px-12 lg:pt-20">
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-12">

                    {/* Brand */}
                    <div className="sm:col-span-2 lg:col-span-3">
                        <Link
                            to="/"
                            className="inline-flex items-center rounded-xl bg-white p-3 transition hover:opacity-90"
                            aria-label="Arsha Vijnana Trust home"
                        >
                            <img
                                src="/hero.png"
                                alt="Arsha Vijnana Trust"
                                className="h-auto w-28 object-contain sm:w-32"
                            />
                        </Link>

                        <p className="mt-5 max-w-sm text-sm leading-7 text-gray-400">
                            Discover knowledge, explore timeless wisdom, and
                            enrich your journey through meaningful books and
                            learning resources.
                        </p>

                        <Link
                            to="/store"
                            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-orange-400 transition hover:text-orange-300"
                        >
                            Explore our collection
                            <svg
                                viewBox="0 0 24 24"
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="M5 12h14" />
                                <path d="m12 5 7 7-7 7" />
                            </svg>
                        </Link>
                    </div>

                    {/* Quick links */}
                    <div className="lg:col-span-2">
                        <h3 className="text-sm font-bold tracking-widest text-white">
                            QUICK LINKS
                        </h3>

                        <div className="mt-3 h-1 w-10 rounded-full bg-orange-500" />

                        <ul className="mt-6 space-y-4">
                            {[
                                { label: "Home", to: "/" },
                                { label: "About Us", to: "/about" },
                                { label: "Store", to: "/store" },
                                { label: "Contact Us", to: "/contact" },
                            ].map((item) => (
                                <li key={item.to}>
                                    <Link
                                        to={item.to}
                                        className="group inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-orange-400"
                                    >
                                        <span className="h-1 w-1 rounded-full bg-gray-600 transition group-hover:bg-orange-500" />
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Account */}
                    <div className="lg:col-span-2">
                        <h3 className="text-sm font-bold tracking-widest text-white">
                            MY ACCOUNT
                        </h3>

                        <div className="mt-3 h-1 w-10 rounded-full bg-orange-500" />

                        <ul className="mt-6 space-y-4">
                            {[
                                { label: "Shopping Cart", to: "/cart" },
                                { label: "My Orders", to: "/orders" },
                                { label: "My Profile", to: "/profile" },
                            ].map((item) => (
                                <li key={item.to}>
                                    <Link
                                        to={item.to}
                                        className="group inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-orange-400"
                                    >
                                        <span className="h-1 w-1 rounded-full bg-gray-600 transition group-hover:bg-orange-500" />
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Help */}
                    <div className="lg:col-span-2">
                        <h3 className="text-sm font-bold tracking-widest text-white">
                            HELP & SUPPORT
                        </h3>

                        <div className="mt-3 h-1 w-10 rounded-full bg-orange-500" />

                        <ul className="mt-6 space-y-4">
                            <li>
                                <Link
                                    to="/contact"
                                    className="group inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-orange-400"
                                >
                                    <span className="h-1 w-1 rounded-full bg-gray-600 transition group-hover:bg-orange-500" />
                                    Contact Support
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/about#FAQ"
                                    className="group inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-orange-400"
                                >
                                    <span className="h-1 w-1 rounded-full bg-gray-600 transition group-hover:bg-orange-500" />
                                    FAQs
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact details */}
                    <div className="lg:col-span-3">
                        <h3 className="text-sm font-bold tracking-widest text-white">
                            GET IN TOUCH
                        </h3>

                        <div className="mt-3 h-1 w-10 rounded-full bg-orange-500" />

                        <div className="mt-6 space-y-5">
                            {/* Address */}
                            <div className="flex items-start gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                                        <circle cx="12" cy="10" r="2.5" />
                                    </svg>
                                </span>

                                <p className="text-sm leading-6 text-gray-400">
                                    Plot No. 1361, Road No. 45,
                                    <br />
                                    Jubilee Hills Co-operative Housing Society,
                                    <br />
                                    Hyderabad, Telangana 500034
                                </p>
                            </div>

                            {/* Email */}
                            <a
                                href="mailto:info@email.com"
                                className="group flex items-center gap-3 text-sm text-gray-400 transition hover:text-orange-400"
                            >
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <rect
                                            x="3"
                                            y="5"
                                            width="18"
                                            height="14"
                                            rx="2"
                                        />
                                        <path d="m3 7 9 6 9-6" />
                                    </svg>
                                </span>
                                info@email.com
                            </a>

                            {/* Phone */}
                            <a
                                href="tel:+1234567890"
                                className="group flex items-center gap-3 text-sm text-gray-400 transition hover:text-orange-400"
                            >
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 11.2 18a19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 3.18 2 2 0 0 1 4.07 1h3a2 2 0 0 1 2 1.72c.12.96.35 1.9.68 2.8a2 2 0 0 1-.45 2.11L8.03 8.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.33 1.84.56 2.8.68A2 2 0 0 1 22 16.92Z" />
                                    </svg>
                                </span>
                                +123 456 789 0
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom section */}
                <div className="mt-12 border-t border-white/10 pt-6 sm:mt-16">
                    <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
                        <p className="text-xs leading-6 text-gray-500 sm:text-sm">
                            © {currentYear}{" "}
                            <span className="font-semibold text-orange-400">
                                Arsha Vijnana Trust
                            </span>
                            . All rights reserved.
                        </p>

                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 transition hover:text-orange-400 sm:text-sm"
                        >
                            Back to home
                            <svg
                                viewBox="0 0 24 24"
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="m18 15-6-6-6 6" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
