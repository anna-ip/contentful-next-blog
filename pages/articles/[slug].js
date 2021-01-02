import {createClient} from 'contentful'
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'; //This npm package that will render our content from contentful, se how its used further down
import { BLOCKS } from '@contentful/rich-text-types';
import Image from 'next/image'


const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN
});
//This is to create a list of all the pages we want
// getStaticPaths is run at built time 
export async function getStaticPaths() {

    let data = await client.getEntries({
        // This query will get all the content from Article (always add it in lower case) that we saved in the Content Model in Contentful 
        content_type: "article",
      });

    return {
        // paths is an array of all the articles that we created
        paths: data.items.map((item) => ({
           params: { slug: item.fields.slug},
        })),
        
        fallback: true,
    };
}

//getStaticProps is run at built time 
//getStaticProps will get the content from the params in getStaticPaths as a context object that we can destructure like {params}
export async function getStaticProps({params}){
    // We're only need one entry but since we need to wriet a query we need to write getEntries
    let data = await client.getEntries({
        content_type: 'article',
        //params.slug is defined in the getSatticPaths
        'fields.slug': params.slug
    })
    return{
        props: {
            article: data.items[0]
        }
    }
}

//here we get to pass props that we can destructure to {article}
export default function Article({article}) {
    console.log(article);

    return( 
        <div>
            <h1> {article.fields.title}</h1>
            {/* This npm package will help render the contentful content */}
            <div>
                {documentToReactComponents(article.fields.content, {
                renderNode: {
                    // a function that returns a react component <Image />
                    [BLOCKS.EMBEDDED_ASSET]: (node) => (
                        <Image 
                            src={'https:' + node.data.target.fields.file.url} 
                            //needs a width & height included in <Image/> it will be provided in the contentful data.
                            width={node.data.target.fields.file.details.image.width} 
                            height={node.data.target.fields.file.details.image.height}
                        >
                        </Image>
                    )
                }
                })}
            </div>
        </div>
    )
}