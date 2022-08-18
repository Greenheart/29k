import * as Router from 'koa-router';
import {firestore} from 'firebase-admin';
import 'firebase-functions';

import {Temple} from '../../../../shared/src/types/Temple';
import {createRoom} from '../../lib/daily';

const TEMPLES_COLLECTION = 'temples';

const templesRouter = new Router();
templesRouter.get('/', async ctx => {
  const {response} = ctx;

  const snapshot = await firestore().collection(TEMPLES_COLLECTION).get();
  const temples = snapshot.docs.map(doc => doc.data()) as Temple[];

  response.status = 200;
  ctx.body = temples;
});

templesRouter.post('/', async ctx => {
  const {name} = ctx.request.body;

  const data = await createRoom(name);
  const temple: Temple = {
    id: data.id,
    name,
    url: data.url,
    active: false,
  };

  await firestore().collection(TEMPLES_COLLECTION).doc(data.id).create(temple);

  ctx.body = data;
});

export {templesRouter};
