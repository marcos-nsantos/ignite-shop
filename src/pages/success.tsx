import { ImageContainer, SuccessContainer } from "@/src/styles/pages/success";
import Link from "next/link";
import Image from "next/image";
import { GetServerSideProps } from "next";
import { stripe } from "@/src/lib/stripe";
import Stripe from "stripe";
import Head from "next/head";

interface SuccessProps {
  costumerName: string;
  product: {
    name: string;
    imageUrl: string;
  };
}

export default function Success({ costumerName, product }: SuccessProps) {
  return (
    <>
      <Head>
        <title>Compra efetuada | Ignite Shop</title>

        <meta name="robots" content="noindex" />
      </Head>

      <SuccessContainer>
        <h1>Compra efetuada</h1>

        <ImageContainer>
          <Image src={product.imageUrl} width={120} height={110} alt="" />
        </ImageContainer>

        <p>
          Uhuul <strong>{costumerName}</strong>, sua{" "}
          <strong>{product.name}</strong> já está a caminho da sua casa.
        </p>

        <Link href="/">Voltar ao catálogo</Link>
      </SuccessContainer>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  if (!query.session_id) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const sessionId = String(query.session_id);

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items", "line_items.data.price.product"],
  });

  if (!session.customer_details) {
    console.error("Customer details missing in Stripe session:", sessionId);
    return {
      notFound: true,
    };
  }

  const costumerName = session.customer_details.name;
  const product = session.line_items?.data[0]?.price?.product as Stripe.Product;

  if (!product) {
    console.error("Product information missing in Stripe session:", sessionId);
    return {
      notFound: true,
    };
  }

  return {
    props: {
      costumerName,
      product: {
        name: product.name,
        imageUrl: product.images?.[0] || "",
      },
    },
  };
};
