
import { Link } from "react-router-dom";
import {
    BookOpen,
    BookMarked,
    Landmark,
    Heart,
    ArrowRight,
    ScrollText,
    GraduationCap,
} from "lucide-react";

function AboutPage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50">
                <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-orange-200/30 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />

                <div className="container relative mx-auto px-4 py-16 sm:py-20 lg:py-24">
                    <div className="mx-auto max-w-3xl text-center">
                        <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-sm font-semibold text-orange-700 shadow-sm">
                            <BookOpen size={16} />
                            About Arsha Vijnana Trust
                        </span>

                        <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                            Preserving India's{" "}
                            <span className="text-orange-600">
                                Timeless Wisdom
                            </span>
                        </h1>

                        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-gray-600 sm:text-lg">
                            Discover the rich heritage of Indian philosophy,
                            Vedic literature, and classical Sanskrit and Telugu
                            texts through books that preserve knowledge for
                            generations to come.
                        </p>

                        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                            <Link
                                to="/store"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
                            >
                                Explore Our Books
                                <ArrowRight size={18} />
                            </Link>

                            <Link
                                to="/contact"
                                className="inline-flex items-center justify-center rounded-xl border border-orange-200 bg-white px-6 py-3 font-semibold text-orange-700 transition hover:border-orange-300 hover:bg-orange-50"
                            >
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Introduction Section */}
            <section className="container mx-auto px-4 py-16 sm:py-20">
                <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                    <div>
                        <span className="text-sm font-bold uppercase tracking-widest text-orange-600">
                            Who We Are
                        </span>

                        <h2 className="mt-3 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
                            A Legacy of Knowledge, Culture and Tradition
                        </h2>

                        <div className="mt-6 space-y-4 text-base leading-8 text-gray-600">
                            <p>
                                Arsha Vijnana Trust is a Hyderabad-based
                                non-profit organization dedicated to
                                preserving, publishing, and promoting India's
                                rich cultural, spiritual, and literary
                                heritage.
                            </p>

                            <p>
                                Our work focuses on making important texts
                                relating to Indian philosophy, Vedic
                                traditions, and the great epics accessible to
                                readers, students, researchers, and all those
                                interested in India's intellectual heritage.
                            </p>

                            <p>
                                Through our publications, we seek to keep
                                traditional knowledge alive and encourage its
                                study by future generations.
                            </p>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-orange-200 to-amber-100 opacity-70 blur-sm" />

                        <div className="relative overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 p-8 sm:p-10">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-600/20">
                                <Landmark size={32} />
                            </div>

                            <h3 className="mt-6 text-2xl font-bold text-gray-900">
                                Rooted in Tradition
                            </h3>

                            <p className="mt-4 leading-8 text-gray-600">
                                India's ancient texts carry profound insights
                                into philosophy, ethics, culture, and human
                                life. Preserving these works helps connect
                                modern readers with a remarkable intellectual
                                tradition.
                            </p>

                            <div className="mt-8 border-t border-orange-200 pt-6">
                                <div className="flex items-start gap-3">
                                    <Heart
                                        size={22}
                                        className="mt-1 shrink-0 text-orange-600"
                                    />
                                    <p className="text-sm leading-6 text-gray-700">
                                        Dedicated to preserving and sharing
                                        India's literary and cultural heritage.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="bg-orange-50/70">
                <div className="container mx-auto px-4 py-16 sm:py-20">
                    <div className="mx-auto max-w-3xl text-center">
                        <span className="text-sm font-bold uppercase tracking-widest text-orange-600">
                            Our Purpose
                        </span>

                        <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
                            Our Mission
                        </h2>

                        <p className="mt-5 text-base leading-8 text-gray-600 sm:text-lg">
                            We aim to preserve valuable traditional works,
                            support access to authentic texts, and inspire
                            continued learning about India's philosophical,
                            spiritual, and literary traditions.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 md:grid-cols-3">
                        <div className="rounded-2xl border border-orange-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-100/70">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                                <BookMarked size={25} />
                            </div>
                            <h3 className="mt-5 text-xl font-bold text-gray-900">
                                Preserve Knowledge
                            </h3>
                            <p className="mt-3 leading-7 text-gray-600">
                                Help safeguard classical texts and traditional
                                works that form an important part of India's
                                cultural heritage.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-orange-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-100/70">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                                <ScrollText size={25} />
                            </div>
                            <h3 className="mt-5 text-xl font-bold text-gray-900">
                                Promote Literature
                            </h3>
                            <p className="mt-3 leading-7 text-gray-600">
                                Make important works in Indian philosophy,
                                Vedic literature, and classical languages
                                accessible to readers.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-orange-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-100/70">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                                <GraduationCap size={25} />
                            </div>
                            <h3 className="mt-5 text-xl font-bold text-gray-900">
                                Inspire Learning
                            </h3>
                            <p className="mt-3 leading-7 text-gray-600">
                                Encourage students, scholars, and curious
                                readers to explore India's rich intellectual
                                and philosophical traditions.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Publications Section */}
            <section className="container mx-auto px-4 py-16 sm:py-20">
                <div className="mx-auto max-w-3xl text-center">
                    <span className="text-sm font-bold uppercase tracking-widest text-orange-600">
                        Explore Our Collection
                    </span>

                    <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
                        Books That Connect Generations
                    </h2>

                    <p className="mt-5 leading-8 text-gray-600">
                        Our collection brings together works from India's
                        enduring literary and philosophical traditions.
                    </p>
                </div>

                <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        {
                            title: "Ramayana",
                            description:
                                "Explore editions and interpretations of the timeless Indian epic.",
                        },
                        {
                            title: "Mahabharata",
                            description:
                                "Discover the great epic through its many Parvas and teachings.",
                        },
                        {
                            title: "Vedic Literature",
                            description:
                                "Learn about Vedic traditions and India's ancient knowledge systems.",
                        },
                        {
                            title: "Classical Texts",
                            description:
                                "Discover scholarly works in Sanskrit, Telugu, and Indian philosophy.",
                        },
                    ].map((item) => (
                        <div
                            key={item.title}
                            className="group rounded-2xl border border-gray-100 bg-white p-6 transition hover:border-orange-200 hover:shadow-lg hover:shadow-orange-100/60"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition group-hover:bg-orange-600 group-hover:text-white">
                                <BookOpen size={24} />
                            </div>

                            <h3 className="mt-5 text-lg font-bold text-gray-900">
                                {item.title}
                            </h3>

                            <p className="mt-3 text-sm leading-7 text-gray-600">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-10 text-center">
                    <Link
                        to="/store"
                        className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-700"
                    >
                        Browse All Books
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* Closing CTA */}
            <section className="px-4 pb-16 sm:pb-20">
                <div className="container mx-auto overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-12 text-center shadow-xl shadow-orange-600/15 sm:px-12 sm:py-14">
                    <h2 className="text-3xl font-bold text-white sm:text-4xl">
                        Discover the Wisdom of the Ages
                    </h2>

                    <p className="mx-auto mt-4 max-w-2xl leading-7 text-orange-50">
                        Explore our collection and discover books that
                        celebrate India's timeless literature, philosophy,
                        and cultural heritage.
                    </p>

                    <Link
                        to="/store"
                        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-orange-700 transition hover:bg-orange-50"
                    >
                        Explore Books
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </section>
        </main>
    );
}

export default AboutPage;
