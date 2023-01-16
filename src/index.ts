import { startCluster } from './cluster';
import { startServer } from './server';

if (process.env.NODE_ENV === 'multi') {
  startCluster();
} else {
  startServer();
}

const signalHandler = () => {
  process.exit(0);
};

process.on('SIGINT', signalHandler);
process.on('SIGTERM', signalHandler);
process.on('SIGQUIT', signalHandler);
process.on('ESRCH', signalHandler);
