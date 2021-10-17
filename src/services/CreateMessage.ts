import { MessageProps } from '../types/Seismicportal';

const CreateMessage = ({ mag, hour, local, lat, long, last }: MessageProps) => {
    const message = `🚨 *Atenção* 🚨
    *Magnitude*: ${mag} ML
    *Localidade*: ${local}
    *Horário*: ${hour}
    Latitude: ${lat}
    Longitude: ${long}
    Tremores nas ultimas 24 horas: ${last}
    `;

    return message;
};

export default CreateMessage;
