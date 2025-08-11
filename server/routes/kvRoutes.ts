import { Hono } from 'hono';
import type { Env } from '../types';
import { setKv, getKv, deleteKv, listKv } from '../controllers/kvController';

const kvRoutes = new Hono<{ Bindings: Env }>();

kvRoutes.post('/set', setKv);
kvRoutes.get('/get/:key', getKv);
kvRoutes.delete('/:key', deleteKv);
kvRoutes.get('/list', listKv);

export default kvRoutes;


