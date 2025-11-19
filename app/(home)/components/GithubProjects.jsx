"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaExclamationCircle, FaSpinner, FaStar, FaCodeBranch } from 'react-icons/fa';
import { HiExternalLink } from 'react-icons/hi';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { config } from '@/config';
import useSWR from 'swr';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const ITEMS_PER_PAGE = 6;

// 🔥 FIXED URL
const GITHUB_API_URL = `https://api.github.com/users/${config.social.github}/repos`;

const fetcher = async (url) => {
    const res = await fetch(url);

    if (!res.ok) {
        const errorData = await res.json();
        const error = new Error('Failed to fetch GitHub projects');
        error.info = errorData.message;
        error.status = res.status;
        throw error;
    }

    return res.json();
};

const GithubProjects = () => {
    const [page, setPage] = React.useState(1);
    const [isLoadingMore, setIsLoadingMore] = React.useState(false);

    const { data, error, isLoading, mutate } = useSWR(
        `${GITHUB_API_URL}?sort=updated&per_page=${ITEMS_PER_PAGE * page}`,
        fetcher,
        {
            revalidateOnFocus: false,
            refreshInterval: 300000,
            shouldRetryOnError: false,
        }
    );

    const projects = React.useMemo(() => {
        if (!data) return [];

        return data
            .filter(project => !project.fork && !project.private)
            .slice(0, ITEMS_PER_PAGE * page)
            .map((project, index) => ({ ...project }));
    }, [data, page]);

    const loadMore = () => setPage(prev => prev + 1);

    return (
        <section className="py-20">
            <div className="container mx-auto px-4">
                <motion.h2 className="text-center text-3xl font-bold mb-10">
                    🚀 Github Projects
                </motion.h2>

                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Array(ITEMS_PER_PAGE).fill(0).map((_, i) => (
                            <Skeleton key={i} className="h-40 rounded-xl" />
                        ))}
                    </div>
                ) : error ? (
                    <Alert variant="destructive" className="mt-5">
                        <FaExclamationCircle className="mr-2" />
                        <AlertDescription>
                            {error?.info || "Unable to load GitHub data. Please wait or try again."}
                        </AlertDescription>
                        <Button onClick={() => mutate()} className="ml-auto mt-2">
                            Retry
                        </Button>
                    </Alert>
                ) : (
                    <motion.div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {projects.map(project => (
                            <motion.a
                                key={project.id}
                                href={project.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-black/20 hover:bg-black/30 p-4 rounded-xl border border-white/10 transition"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-bold">{project.name}</span>
                                    <HiExternalLink size={18} />
                                </div>

                                <p className="text-sm text-white/60 mt-2 line-clamp-2">
                                    {project.description || "No description"}
                                </p>

                                <div className="flex items-center gap-4 text-xs mt-3 text-white/70">
                                    <span><FaStar size={12} className="inline" /> {project.stargazers_count}</span>
                                    <span><FaCodeBranch size={12} className="inline" /> {project.forks_count}</span>
                                </div>
                            </motion.a>
                        ))}
                    </motion.div>
                )}

                {!error && data?.length > projects.length && (
                    <Button
                        onClick={loadMore}
                        disabled={isLoadingMore}
                        className="mt-10 mx-auto block px-6 py-3 rounded-full"
                    >
                        {isLoadingMore ? (
                            <>
                                <FaSpinner className="animate-spin mr-2" /> Loading...
                            </>
                        ) : (
                            "Load More"
                        )}
                    </Button>
                )}

                <div className="text-center mt-6">
                    <Button asChild variant="outline">
                        <a href={`https://github.com/${config.social.github}`} target="_blank">
                            View Full GitHub Profile
                        </a>
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default GithubProjects;
