import { startCluster } from './cluster';
import { startServer } from './server';

if (process.env.NODE_ENV === 'multi') {
  startCluster();
} else {
  startServer();
}