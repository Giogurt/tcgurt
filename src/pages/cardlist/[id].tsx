import Head from "next/head";
import Image from "next/image";
import "dayjs/locale/es-mx";
import { RouterOutputs, api } from "~/utils/api";
import { useUser } from "@clerk/nextjs";
import { Navbar } from "~/components/navbar";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { FC, useState } from "react";
import { Loader2, Minus, Plus } from "lucide-react";
import { useRouter } from "next/router";
import { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import { helpers } from "~/server/helpers/ssHelper";

type Card = RouterOutputs["cards"]["getCards"][number];
const SearchCard = (cardInfo: Card) => {
  return (
    // <div className="hover:scale-150">
    <div className="group relative flex items-end justify-center">
      <Image
        className="object-cover"
        alt={cardInfo.name}
        src={cardInfo.images.large}
        width={150}
        height={200}
      />
      <Button
        variant="green"
        size="icon"
        className="absolute m-2 hidden rounded-full bg-green-700 group-hover:flex"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};

const DeckCard = (cardInfo: Card) => {
  return (
    // <div className="hover:scale-150">
    <div className="group relative flex items-end justify-center">
      <Image
        className="object-cover"
        alt={cardInfo.name}
        src={cardInfo.images.large}
        width={150}
        height={200}
      />
      <div className="absolute hidden w-full justify-around pb-2 group-hover:flex">
        <Button
          variant="green"
          size="icon"
          className="rounded-full bg-green-700 "
        >
          <Minus className="h-6 w-6" />
        </Button>
        <Button
          variant="green"
          size="icon"
          className="rounded-full bg-green-700"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

const BasicCard = (cardInfo: Card) => {
  return (
    // <div className="hover:scale-150">
    // <div className="group relative flex items-end justify-center">
    <Image
      className="hover:scale-150"
      alt={cardInfo.name}
      src={cardInfo.images.large}
      width={150}
      height={200}
    />
    // </div>
  );
};

interface SearchBarProps {
  onSearch: (cardName: string) => void;
  loading: boolean;
}
const SearchBar: FC<SearchBarProps> = ({ onSearch, loading }) => {
  const [cardName, setCardName] = useState("");

  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <Input
        value={cardName}
        onChange={(e) => setCardName(e.target.value)}
        aria-label="Search"
        placeholder="Whimsicott"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSearch(cardName);
          }
        }}
      />
      <Button
        onClick={() => {
          onSearch(cardName);
        }}
        disabled={loading}
      >
        {!!loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Buscar
      </Button>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const helper = helpers;

  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("No id");

  const wishlistId = Number(id);
  await helper.cardLists.findById.prefetch({ wishlistId });

  return {
    props: {
      trpcState: helper.dehydrate(),
      wishlistId,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default function CardListPage(
  props: InferGetStaticPropsType<typeof getStaticProps>,
) {
  const { wishlistId } = props;

  const router = useRouter();
  const [cardSearchData, setCardSearchData] = useState({
    name: "",
    onlyStandard: true,
  });

  // Queries
  const { data: cardListData } = api.cardLists.findById.useQuery({
    wishlistId,
  });

  const {
    data: cardsData,
    refetch: searchRefetch,
    isFetching: searchFetching,
  } = api.cards.getCards.useQuery(cardSearchData, {
    enabled: cardSearchData.name != "",
  });

  // Filter card data in server
  console.log(cardsData);

  const searchCard = (cardName: string) => {
    setCardSearchData({ name: cardName, onlyStandard: true });
    searchRefetch();
  };

  return (
    <>
      <Head>
        <title>TCG CUU</title>
        <meta name="description" content="Pokemon TCG Chihuahua" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen overflow-y-auto">
        <Navbar />
        <div className="mx-auto my-10 max-w-screen-xl px-4 py-8 lg:px-6 lg:py-16 ">
          <div className="mx-auto mb-10 max-w-screen-sm text-center lg:mb-16">
            <h2 className="mb-4 text-4xl font-extrabold tracking-tight">
              {cardListData?.name}
            </h2>
          </div>

          <div className="mx-auto mb-16 text-center lg:mb-20">
            <h3 className="mb-2 text-2xl tracking-tight lg:mb-4">
              Agrega nuevas cartas a tu lista
            </h3>
            <div className="mb-6 flex justify-center">
              <SearchBar onSearch={searchCard} loading={searchFetching} />
            </div>
            <div className=" flex flex-wrap justify-center gap-3">
              {cardsData?.map((card, index) => {
                return (
                  <div key={index}>
                    <SearchCard {...card} />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mx-auto mb-2 text-center lg:mb-4">
            <h3 className="mb-2 text-2xl tracking-tight lg:mb-4">
              Cartas en tu lista
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {cardsData?.map((card, index) => {
                return (
                  <div key={index}>
                    <DeckCard {...card} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
