import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart } from 'lucide-react';
import { NakamaLogo } from './NakamaLogo';

const Footer = () => {
    return (
        <footer className="relative z-10 pt-12 pb-8 bg-[#050505] border-t border-white/[0.04]">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-10">

                    {/* Brand */}
                    <div className="space-y-4">
                        <Link to="/" className="block w-fit">
                            <NakamaLogo className="h-7 w-auto" />
                        </Link>
                        <p className="text-[13px] text-[#555] leading-relaxed max-w-xs">
                            Stream, rank, and debate anime with the most dedicated community on the internet.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-[11px] font-semibold text-[#444] uppercase tracking-[0.12em] mb-3">Discover</h4>
                            <ul className="space-y-2.5">
                                <FooterLink to="/library">Library</FooterLink>
                                <FooterLink to="/news">News</FooterLink>
                                <FooterLink to="/characters">Characters</FooterLink>
                                <FooterLink to="/tiering">Rankings</FooterLink>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-[11px] font-semibold text-[#444] uppercase tracking-[0.12em] mb-3">Social</h4>
                            <ul className="space-y-2.5">
                                <FooterLink to="/community">Community</FooterLink>
                                <FooterLink to="/clan">Clans</FooterLink>
                                <FooterLink to="/oracle">The Sensei</FooterLink>
                                <FooterLink to="/marketplace">Marketplace</FooterLink>
                            </ul>
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-[11px] font-semibold text-[#444] uppercase tracking-[0.12em] mb-3">Stay Updated</h4>
                        <p className="text-[13px] text-[#555] mb-3">Weekly picks and community highlights.</p>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="your@email.com"
                                className="w-full px-4 py-2.5 rounded-lg text-white placeholder-[#444] pr-10 text-sm bg-white/[0.03] border border-white/[0.06] focus:border-white/[0.12] focus:outline-none transition-colors"
                            />
                            <button className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-[#e5484d] text-white hover:bg-[#f26065] transition-colors">
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="h-[1px] bg-white/[0.04] mb-6" />
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#333]">
                    <p>© {new Date().getFullYear()} Nakama Network</p>
                    <div className="flex items-center gap-5">
                        <Link to="#" className="hover:text-[#555] transition-colors">Privacy</Link>
                        <Link to="#" className="hover:text-[#555] transition-colors">Terms</Link>
                        <span className="flex items-center gap-1">
                            Made with <Heart size={9} className="text-[#e5484d]" fill="currentColor" /> for fans
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const FooterLink = ({ to, children }) => (
    <li className="list-none">
        <Link to={to} className="text-[13px] text-[#555] hover:text-white transition-colors">
            {children}
        </Link>
    </li>
);

export default Footer;
