import { ImageContainer, SuccessContainer } from "@/src/styles/pages/success";
import Link from "next/link";
import Image from "next/image";
import { GetServerSideProps } from "next";
import { stripe } from "@/src/lib/stripe";
import Stripe from "stripe";

interface SuccessProps {
  costumerName: string;
  product: {
    name: string;
    imageUrl: string;
  };
}

export default function Success({ costumerName, product }: SuccessProps) {
  return (
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
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const sessionId = String(query.session_id);
  let session;

  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "line_items.data.price.product"],
    });
  } catch (error) {
    console.error("Error retrieving session:", error);
    return {
      notFound: true,
    };
  }

  const customerName = session.customer_details?.name ?? "Unknown Customer";

  const product = session.line_items?.data?.[0]?.price
    ?.product as Stripe.Product;

  return {
    props: {
      customerName,
      product: {
        name: product?.name ?? "Unknown Product",
        imageUrl: product?.images?.[0] ?? "default_image_url",
      },
    },
  };
};
