import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
    Mail,
    Phone,
    MapPin,
    Clock,
    Send,
    BookOpen,
    ArrowRight,
    MessageCircle,
} from "lucide-react";

function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Connect your contact API here to send the message.
        console.log("Contact form data:", formData);

        setSubmitted(true);
        setFormData({
            name: "",
            email: "",
            subject: "",
            message: "",
        });
    };

    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50">
                <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-orange-200/30 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />

                <div className="container relative mx-auto px-4 py-16 text-center sm:py-20 lg:py-24">
                    <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-sm font-semibold text-orange-700 shadow-sm">
                        <MessageCircle size={16} />
                        Get in Touch
                    </span>

                    <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                        We'd Love to{" "}
                        <span className="text-orange-600">Hear from You</span>
                    </h1>

                    <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-gray-600 sm:text-lg">
                        Have a question about our publications, need help
                        with an order, or want to learn more about our work?
                        We are happy to hear from you.
                    </p>

                    <div className="mt-8 flex justify-center">
                        <Link
                            to="/store"
                            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
                        >
                            Explore Our Books
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Contact Information */}
            <section className="container mx-auto px-4 py-14 sm:py-16">
                <div className="mx-auto max-w-3xl text-center">
                    <span className="text-sm font-bold uppercase tracking-widest text-orange-600">
                        Contact Information
                    </span>

                    <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
                        How Can We Help You?
                    </h2>

                    <p className="mt-4 leading-8 text-gray-600">
                        Reach out to us for enquiries about books,
                        publications, orders, or our activities.
                    </p>
                </div>

                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <a
                        href="mailto:info@arshavijnana.org"
                        className="group rounded-2xl border border-orange-100 bg-white p-6 text-center transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-100/60"
                    >
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-700 transition group-hover:bg-orange-600 group-hover:text-white">
                            <Mail size={26} />
                        </div>

                        <h3 className="mt-4 font-bold text-gray-900">
                            Email Us
                        </h3>

                        <p className="mt-2 break-words text-sm text-gray-600">
                            info@arshavijnana.org
                        </p>
                    </a>

                    <div className="rounded-2xl border border-orange-100 bg-white p-6 text-center transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-100/60">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
                            <Phone size={26} />
                        </div>

                        <h3 className="mt-4 font-bold text-gray-900">
                            Call Us
                        </h3>

                        <p className="mt-2 text-sm text-gray-600">
                            Contact us for assistance
                        </p>
                    </div>

                    <div className="rounded-2xl border border-orange-100 bg-white p-6 text-center transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-100/60">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
                            <MapPin size={26} />
                        </div>

                        <h3 className="mt-4 font-bold text-gray-900">
                            Our Location
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-gray-600">
                            Hyderabad, Telangana, India
                        </p>
                    </div>

                    <div className="rounded-2xl border border-orange-100 bg-white p-6 text-center transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-100/60">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
                            <Clock size={26} />
                        </div>

                        <h3 className="mt-4 font-bold text-gray-900">
                            Working Hours
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-gray-600">
                            Reach out by email anytime
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Form */}
            <section className="bg-orange-50/60">
                <div className="container mx-auto px-4 py-16 sm:py-20">
                    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
                        {/* Left Content */}
                        <div className="flex flex-col justify-center">
                            <span className="text-sm font-bold uppercase tracking-widest text-orange-600">
                                Send Us a Message
                            </span>

                            <h2 className="mt-3 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
                                Let's Start a Conversation
                            </h2>

                            <p className="mt-5 leading-8 text-gray-600">
                                Whether you are looking for a particular
                                publication, have a question about an order,
                                or would like to know more about Arsha Vijnana
                                Trust, please send us a message.
                            </p>

                            <div className="mt-8 rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                                        <BookOpen size={24} />
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-gray-900">
                                            Interested in Our Publications?
                                        </h3>

                                        <p className="mt-2 text-sm leading-7 text-gray-600">
                                            Browse our collection of books
                                            covering Indian philosophy,
                                            Vedic literature, and classical
                                            texts.
                                        </p>

                                        <Link
                                            to="/store"
                                            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-orange-600 transition hover:text-orange-700"
                                        >
                                            Browse Books
                                            <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-lg shadow-orange-100/40 sm:p-8 lg:p-10">
                            <h3 className="text-2xl font-bold text-gray-900">
                                Send a Message
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                Fill in the form below and let us know how
                                we can assist you.
                            </p>

                            {submitted && (
                                <div
                                    role="status"
                                    className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
                                >
                                    Thank you for contacting us! Your form
                                    was submitted locally. Connect the form
                                    to your API to send your message.
                                </div>
                            )}

                            <form
                                onSubmit={handleSubmit}
                                className="mt-7 space-y-5"
                            >
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="mb-2 block text-sm font-semibold text-gray-700"
                                    >
                                        Full Name
                                    </label>

                                    <input
                                        id="name"
                                        type="text"
                                        required
                                        autoComplete="name"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                name: e.target.value,
                                            })
                                        }
                                        placeholder="Enter your full name"
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="email"
                                        className="mb-2 block text-sm font-semibold text-gray-700"
                                    >
                                        Email Address
                                    </label>

                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                email: e.target.value,
                                            })
                                        }
                                        placeholder="you@example.com"
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="subject"
                                        className="mb-2 block text-sm font-semibold text-gray-700"
                                    >
                                        Subject
                                    </label>

                                    <input
                                        id="subject"
                                        type="text"
                                        required
                                        value={formData.subject}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                subject: e.target.value,
                                            })
                                        }
                                        placeholder="What is your enquiry about?"
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="message"
                                        className="mb-2 block text-sm font-semibold text-gray-700"
                                    >
                                        Your Message
                                    </label>

                                    <textarea
                                        id="message"
                                        required
                                        rows={5}
                                        value={formData.message}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                message: e.target.value,
                                            })
                                        }
                                        placeholder="Write your message here..."
                                        className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-200"
                                >
                                    Send Message
                                    <Send size={18} />
                                </button>

                                <p className="text-center text-xs leading-5 text-gray-500">
                                    We appreciate your interest in Arsha
                                    Vijnana Trust.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Closing CTA */}
            <section className="px-4 py-16 sm:py-20">
                <div className="container mx-auto overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-12 text-center shadow-xl shadow-orange-600/15 sm:px-12 sm:py-14">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white">
                        <BookOpen size={30} />
                    </div>

                    <h2 className="mt-5 text-3xl font-bold text-white sm:text-4xl">
                        Explore India's Timeless Wisdom
                    </h2>

                    <p className="mx-auto mt-4 max-w-2xl leading-7 text-orange-50">
                        Discover publications that preserve and celebrate
                        India's philosophical, spiritual, and literary
                        traditions.
                    </p>

                    <Link
                        to="/store"
                        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-orange-700 transition hover:bg-orange-50"
                    >
                        Explore Our Books
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </section>
        </main>
    );
}

export default ContactPage;
