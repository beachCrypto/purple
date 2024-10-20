import { getFrameMetadata } from 'frog/next';
import type { Metadata } from 'next';

import styles from './page.module.css';

const now = Date.now();


let shareURL = `https://warpcast.com/~/compose?embeds%5B%5D=https%3A%2F%2Fpurple-frames.pages.dev%2Fapi?${now}&text=start+the+next+purple+dao+auction+and+get+purple+pilled+-+frame+by+%40beachmfer.eth`

export async function generateMetadata(): Promise<Metadata> {
  const frameTags = await getFrameMetadata(
    `${process.env.VERCEL_URL || 'http://localhost:3000'}/api`
  );
  return {
    other: frameTags,
  };
}

export default function Home() {
  return (
    <main className={styles.main}>

      <div className={ styles.card}>
        <div className={styles.button1}>
          <a href={shareURL}>
          <h2>Share Purple Frame</h2>
        </a>
      </div>
        <div className={styles.button1}>
         <a href="https://nouns.build/dao/base/0x8de71d80eE2C4700bC9D4F8031a2504Ca93f7088">
            <h2>Go to Purple site</h2>
          </a>
        </div>
      </div>
    </main>
  );
}
