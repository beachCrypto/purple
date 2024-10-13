import { getFrameMetadata } from 'frog/next';
import type { Metadata } from 'next';

import styles from './page.module.css';

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

      <div className={styles.button1}>
        <a href="https://nouns.build/dao/base/0x8de71d80eE2C4700bC9D4F8031a2504Ca93f7088">
          <p>Purple</p>
        </a>
      </div>
    </main>
  );
}
