import React from 'react';

const Skeleton = ({ className, variant = 'rect' }) => {
    const baseClass = "animate-pulse bg-white/[0.05] border border-white/[0.05]";
    const variantClass = variant === 'circle' ? 'rounded-full' : 'rounded-xl';
    
    return (
        <div className={`${baseClass} ${variantClass} ${className}`} />
    );
};

export const AnimeCardSkeleton = () => (
    <div className="flex-shrink-0 w-[160px] sm:w-auto block relative aspect-[3/4] rounded-xl overflow-hidden border border-white/[0.05] bg-[#0a0a0a]">
        <Skeleton className="w-full h-full" />
        <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
            <Skeleton className="h-4 w-3/4 rounded-md" />
            <Skeleton className="h-3 w-1/2 rounded-md" />
        </div>
    </div>
);

export default Skeleton;
