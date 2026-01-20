import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Twitter, Instagram, Youtube, Mail,
    ArrowRight, Heart, Shield, Zap
} from 'lucide-react';
import { NakamaLogo } from './NakamaLogo';

const Footer = () => {
    return (
        <footer className="relative z-10 bg-[#050505] border-t border-white/10 pt-20 pb-10 overflow-hidden">
            {}
            <div className="absolute top-0 left-1/4 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {}
                    <div className="space-y-6">
                        <Link to="/" className="block w-fit">
                            <NakamaLogo className="h-10 w-auto" />
                        </Link>
                        <p className="text-slate-400 leading-relaxed">
                            The ultimate destination for anime enthusiasts.
                            Connect with nakama, battle in the arena, and ascend to godhood.
                        </p>
                        <div className="flex items-center gap-4">
                            <SocialLink icon={Twitter} href="#" />
                            <SocialLink icon={Instagram} href="#" />
                            <SocialLink icon={Youtube} href="#" />
                        </div>
                    </div>

                    {}
                    <div>
                        <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                            <Zap size={18} className="text-yellow-500" />
                            Discover
                        </h4>
                        <ul className="space-y-4">
                            <FooterLink to="/stream">Stream Anime</FooterLink>
                            <FooterLink to="/arena">Battle Arena</FooterLink>
                            <FooterLink to="/clan">Clan HQ</FooterLink>
                            <FooterLink to="/marketplace">Marketplace</FooterLink>
                            <FooterLink to="/tiering">Power Tiering</FooterLink>
                        </ul>
                    </div>

                    {}
                    <div>
                        <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                            <Shield size={18} className="text-yellow-500" />
                            Community
                        </h4>
                        <ul className="space-y-4">
                            <FooterLink to="/community">Wiki & Guides</FooterLink>
                            <FooterLink to="/memes">Meme Corner</FooterLink>
                            <FooterLink to="/clan-wars">Active Wars</FooterLink>
                            <FooterLink to="/oracle">The Oracle</FooterLink>
                            <Link to="/admin" className="text-slate-500 hover:text-yellow-500 transition-colors text-sm flex items-center gap-2">
                                Admin Access
                            </Link>
                        </ul>
                    </div>

                    {}
                    <div>
                        <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                            <Mail size={18} className="text-yellow-500" />
                            Newsletter
                        </h4>
                        <p className="text-slate-400 text-sm mb-4">
                            Subscribe for weekly updates, exclusive badge codes, and anime news.
                        </p>
                        <div className="relative group">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500/50 focus:bg-white/10 transition-all pr-12"
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-yellow-500 rounded-lg text-black hover:bg-yellow-400 transition-colors">
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} Nakama Network. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
                        <div className="flex items-center gap-1">
                            <span>Made with</span>
                            <Heart size={12} className="text-red-500 fill-red-500" />
                            <span>by Founders</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const SocialLink = ({ icon: Icon, href }) => (
    <a
        href={href}
        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-yellow-500 hover:text-black transition-all duration-300"
    >
        <Icon size={18} />
    </a>
);

const FooterLink = ({ to, children }) => (
    <li>
        <Link
            to={to}
            className="text-slate-400 hover:text-yellow-400 transition-colors flex items-center gap-2 group"
        >
            <span className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-yellow-500 transition-colors" />
            {children}
        </Link>
    </li>
);

export default Footer;
