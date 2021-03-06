import { GetStaticPaths, GetStaticProps } from 'next';
import ptBR from 'date-fns/locale/pt-BR';
import { converDurationToTimeString } from "../../utils/convertDurationToTimeString";
import {format, parseISO} from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import {useRouter} from 'next/router';
import { api } from '../../services/api';

import styles from './episode.module.scss';
import { useContext } from 'react';
import { PlayerContext, usePlayer } from '../../contexts/PlayerContext';
import Head from 'next/head';

type Episode = {
    id: string,
    title: string,
    thumbnail: string,
    description: string,
    members: string,
    duration: number,
    durationAsString: string,
    url: string,
    publishedAt: string,
  }


type EpisodeProps = {

    episode: Episode;

}

export default function Episode({episode}: EpisodeProps){

    const { play } = usePlayer();


    return(
        <div className={styles.episode}>

            <Head>
                <title>{episode.title} | Podcastr</title>
            </Head>

            <div className={styles.thumbnailContainer}>
                
                <Link href="/">
                <button type="button">
                    <img src="/arrow-left.svg" alt="Voltar"/>    
                </button>    
                </Link>
                <Image
                width={700}
                height={160}
                src={episode.thumbnail}
                objectFit= "cover"
                />
                
                <button type="button" onClick={() => play(episode)}>
                    <img src="/play.svg" alt="Tocar episódio" />
                </button>
             </div>

             <header>
                 <h1>{episode.title}</h1>
                 <span>{episode.members}</span>
                 <span>{episode.publishedAt}</span>
                 <span>{episode.durationAsString}</span>
             </header>

             <div className={styles.description} dangerouslySetInnerHTML={{__html: episode.description}}>
             </div>
        </div>
    )

}

//O next gera a pagina na build. 
//yarn build -> SSG - Static site generation
//o next n tem informação de qual episodio ele vai gerar de forma estatica
// com o getStaticPaths [] ele nao gera nenhum ep no momento da build
export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: [],   //nao
        fallback: 'blocking' // false = retorna nada 404; true = executa pelo lado do browser
        //Blocking: gera paginas staticas
    }
}

export const getStaticProps: GetStaticProps = async (ctx) => {


    const {slug} = ctx.params;

    const {data} = await api.get(`/episodes/${slug}`)


    const episode =     {
    
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    members: data.members,
    publishedAt: format(parseISO(data.published_at), 'd MMM yy', {locale: ptBR}),
    duration: Number(data.file.duration),
    durationAsString: converDurationToTimeString(Number(data.file.duration)),
    description: data.description,
    url: data.file.url,

  
  };

    return {
        props: {
            episode,
        },
        revalidate: 60 * 60 * 24, //24 hours
    }
}
