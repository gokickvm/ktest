export async function getServerSideProps() {
  return {
    props: {
      serverTime: new Date().toISOString(),
    },
  };
}

export default function Home({ serverTime }) {
  return (
    <div>
      <h1>KickVM SSR Test (Tommy Tester) - redeploy-check-v2</h1>
      <p>This page is server-rendered on every request.</p>
      <p id="server-time">Server time: {serverTime}</p>
    </div>
  );
}
