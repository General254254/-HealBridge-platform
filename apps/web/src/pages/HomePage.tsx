import { Link } from 'react-router-dom';
import {
    Heart,
    Users,
    Bot,
    Shield,
    ArrowRight,
    Sparkles,
    MessageCircle,
    BookOpen,
} from 'lucide-react';

const conditions = [
    {
        name: 'Cancer',
        description: 'Support for all cancer types — from diagnosis through survivorship.',
        color: 'from-rose-400 to-pink-600',
        icon: '🎗️',
        subcategories: ['Breast', 'Lung', 'Colon', 'Leukemia', 'Lymphoma'],
    },
    {
        name: 'Tourette Syndrome',
        description: 'A community that understands the daily realities of tic disorders.',
        color: 'from-violet-400 to-purple-600',
        icon: '🧠',
        subcategories: ['Motor Tics', 'Vocal Tics', 'Combined'],
    },
    {
        name: 'Lyme Disease',
        description: 'Navigating Lyme at every stage — from early detection to chronic management.',
        color: 'from-emerald-400 to-teal-600',
        icon: '🍀',
        subcategories: ['Early Localized', 'Disseminated', 'Chronic/Late'],
    },
];

const features = [
    {
        icon: Users,
        title: 'Peer Support',
        description: 'Connect with survivors and patients who truly understand your journey.',
    },
    {
        icon: Bot,
        title: 'AI Health Copilot',
        description: 'Get personalized guidance from our AI trained on verified medical sources.',
    },
    {
        icon: Shield,
        title: 'HIPAA Compliant',
        description: 'Your health data is encrypted and protected to the highest standards.',
    },
    {
        icon: BookOpen,
        title: 'Curated Resources',
        description: 'Access vetted articles, guides, and research from trusted institutions.',
    },
];

export default function HomePage() {
    return (
        <div className="animate-fade-in">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-400/20 via-transparent to-transparent" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6">
                            <Sparkles className="w-4 h-4" />
                            <span>AI-Powered Peer Support Platform</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight mb-6">
                            You're not alone in this journey
                        </h1>
                        <p className="text-lg md:text-xl text-primary-100 mb-8 leading-relaxed">
                            HealBridge connects patients with recovered survivors, AI-guided health resources,
                            and supportive communities — all in one safe, private space.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-xl hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]">
                                Join the Community
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link to="/copilot" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/20 transition-all border border-white/20">
                                <Bot className="w-5 h-5" />
                                Try AI Copilot
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Disease Categories */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-display font-bold text-calm-800 mb-3">
                        Find Your Community
                    </h2>
                    <p className="text-calm-500 text-lg">
                        Join disease-specific forums tailored to your experience.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {conditions.map((condition) => (
                        <Link
                            key={condition.name}
                            to="/forums"
                            className="group card hover:border-primary-200 cursor-pointer"
                        >
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${condition.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                                {condition.icon}
                            </div>
                            <h3 className="text-xl font-display font-semibold text-calm-800 mb-2">
                                {condition.name}
                            </h3>
                            <p className="text-calm-500 text-sm mb-4">{condition.description}</p>
                            <div className="flex flex-wrap gap-1.5">
                                {condition.subcategories.map((sub) => (
                                    <span key={sub} className="badge bg-calm-100 text-calm-600 text-xs">
                                        {sub}
                                    </span>
                                ))}
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Features Grid */}
            <section className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-display font-bold text-calm-800 mb-3">
                            Everything You Need
                        </h2>
                        <p className="text-calm-500 text-lg">
                            Comprehensive tools for your health journey.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature) => {
                            const Icon = feature.icon;
                            return (
                                <div key={feature.title} className="text-center p-6">
                                    <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Icon className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <h3 className="font-semibold text-calm-800 mb-2">{feature.title}</h3>
                                    <p className="text-sm text-calm-500">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="card-glassmorphism bg-gradient-to-br from-primary-500/5 to-secondary-500/5 text-center py-12 px-6">
                    <MessageCircle className="w-10 h-10 text-primary-500 mx-auto mb-4" />
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-calm-800 mb-3">
                        Ready to Connect?
                    </h2>
                    <p className="text-calm-500 mb-6 max-w-xl mx-auto">
                        Join thousands of patients and survivors supporting each other every day.
                    </p>
                    <Link to="/register" className="btn-primary">
                        Create Free Account
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
