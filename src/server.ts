import 'reflect-metadata';
import 'babel-polyfill';
import 'express-async-errors';
import moment from 'moment-timezone';
import axios from 'axios';
import 'dotenv/config';
import { query as q } from 'faunadb';
import Telegram from 'node-telegram-bot-api';
import express from 'express';

import { DataResponse, EarthquakeData } from './types/Seismicportal';
import CreateMessage from './services/CreateMessage';

import { fauna } from './services/fauna';

const urlQuery = 'https://www.seismicportal.eu/fdsnws/event/1/query';
const limit = 50;
const dateNow = new Date();
const now = moment(dateNow).add(8, 'hours').tz('America/Sao_Paulo').format();
const before = moment(dateNow).subtract(24, 'hours').tz('America/Sao_Paulo').format();
const latitude = 28.26;
const longitude = -16.34;
const maxradius = 5;
const format = 'json';
const minMagnitude = 3;
const telegramToken = process.env.TELEGRAM_API_KEY || '';
const telegramChatId = process.env.TELEGRAM_CHAT_ID || '';

const botTelegram = new Telegram(telegramToken, { polling: true });

let times = 0;

const start = async () => {
    console.log('Server Started');
    setInterval(async () => {
        times += 1;

        console.log(`Numero de consultas: ${times}`);
        try {
            const response = await axios.get<DataResponse>(
                `${urlQuery}?limit=${limit}&start=${before}&end=${now}&lat=${latitude}&lon=${longitude}&maxradius=${maxradius}&format=${format}&minmag=${minMagnitude}`,
            );

            const promises = await response.data.features.map(async feature => {
                const dataCreated = await fauna.query<EarthquakeData>(
                    q.If(
                        q.Not(q.Exists(q.Match(q.Index('events_by_id'), feature.id))),
                        q.Create(q.Collection('earthquake_events'), {
                            data: {
                                id: feature.id,
                                magnitude: feature.properties.mag,
                                latitude: feature.properties.lat,
                                longitude: feature.properties.lon,
                                depth: feature.properties.depth,
                                time: feature.properties.time,
                                source_id: feature.properties.source_id,
                                region: feature.properties.flynn_region,
                                last24: response.data.metadata.totalCount,
                            },
                        }),
                        {
                            data: {
                                id: feature.id,
                                status: 'already created',
                                alreadyCreated: true,
                            },
                        },
                    ),
                );

                return dataCreated;
            });

            const dataEarthquake = await Promise.all(promises);

            dataEarthquake.map(async seism => {
                if (!seism.data.alreadyCreated) {
                    console.log(seism);
                    const { data } = seism;
                    await botTelegram.sendMessage(
                        telegramChatId,
                        CreateMessage({
                            mag: data.magnitude,
                            local: data.region,
                            hour: moment(data.time).utcOffset('-0400').format('YYYY/MM/DD HH:mm'),
                            lat: data.latitude,
                            lon: data.longitude,
                            depth: data.depth,
                            last: data.last24,
                        }),
                        { parse_mode: 'Markdown' },
                    );
                }
            });
        } catch {
            console.log('N??o h?? dados');
        }
    }, 1000 * 60);
};

start().then();

const app = express();

app.use(express.json());

app.listen(process.env.PORT || 3090, () => {
    console.log(`???? Server started on port ${process.env.PORT || 3090}!`);
});
