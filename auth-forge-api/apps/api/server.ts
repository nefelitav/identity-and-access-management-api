import app from './app';
import redisClient from './utils/redis';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    redisClient.connect();
    console.log(`Server running on port ${PORT}`);
});
