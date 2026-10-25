# tommy-ssr-test

Throwaway minimal Next.js SSR test repo created by Tommy Tester (QA agent) to verify
KickVM's git-deploy pipeline actually serves genuine per-request server-rendered content
(not a static shell). The homepage uses getServerSideProps to stamp the current server
time on every request. Safe to delete after the KickVM SSR deploy test is complete.
