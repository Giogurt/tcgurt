import Head from "next/head";
import Image from "next/image";
import { type RouterOutputs, api } from "~/utils/api";
import { useUser } from "@clerk/nextjs";
import { Navbar } from "~/components/navbar";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { type FC, useState } from "react";
import { Loader2, Minus, Plus } from "lucide-react";
import type { GetStaticProps } from "next";
import { helpers } from "~/server/helpers/ssHelper";
import { toast } from "~/components/ui/use-toast";

type Card = RouterOutputs["cards"]["getCards"][number];

type DeckCard = RouterOutputs["cardLists"]["findById"]["cards"][number];
const DeckCard = (cardInfo: DeckCard) => {
  return (
    // <div className="hover:scale-150">
    <div className="group relative flex items-end justify-center">
      <Image
        className="object-cover"
        alt={cardInfo.name ? cardInfo.name : cardInfo.apiId}
        src={cardInfo.imageUrl ? cardInfo.imageUrl : ""}
        width={150}
        height={200}
      />
      <div className="absolute flex w-full items-center justify-around pb-2">
        <Button
          variant="green"
          size="icon"
          className="hidden rounded-full bg-green-700 group-hover:flex "
        >
          <Minus className="h-6 w-6" />
        </Button>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-700">
          <p className="text-center text-lg font-bold text-white">
            {cardInfo.quantity}
          </p>
        </div>
        <Button
          variant="green"
          size="icon"
          className="hidden rounded-full bg-green-700 group-hover:flex"
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

// type Cards = RouterOutputs["cards"]["getCards"];
// const CardListView = (cards: Cards) => {
//   <div className="mx-auto mb-2 text-center lg:mb-4">
//     <h3 className="mb-2 text-2xl tracking-tight lg:mb-4">Cartas en tu lista</h3>
//     <div className="flex flex-wrap justify-center gap-3">
//       {cards?.map((card, index) => {
//         return (
//           <div key={index}>
//             <DeckCard {...card} />
//           </div>
//         );
//       })}
//     </div>
//   </div>;
// };

export const getStaticProps: GetStaticProps = async (context) => {
  const helper = helpers;

  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("No id");

  const cardListId = Number(id);
  await helper.cardLists.findById.prefetch({ cardListId });

  return {
    props: {
      trpcState: helper.dehydrate(),
      cardListId,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default function CardListPage(props: { cardListId: number }) {
  const { cardListId } = props;

  const { user } = useUser();

  const [cardSearchData, setCardSearchData] = useState({
    name: "",
    onlyStandard: true,
  });

  const ctx = api.useContext();

  // Queries
  const { data: cardListData } = api.cardLists.findById.useQuery({
    cardListId,
  });

  const {
    data: cardsData,
    refetch: searchRefetch,
    isFetching: searchFetching,
  } = api.cards.getCards.useQuery(cardSearchData, {
    enabled: cardSearchData.name != "",
  });

  // Mutations
  const { mutate: addCardMutation, isLoading: addCardLoading } =
    api.cardLists.addCard.useMutation({
      onSuccess: () => {
        void ctx.cardLists.findById.invalidate();
        console.log("success");
      },
      onError: (error) => {
        console.log(error);
        toast({ variant: "destructive", title: "Error al agregar carta" });
      },
    });

  // End QM

  if (!cardListData) return <div>404</div>;

  const searchCard = (cardName: string) => {
    setCardSearchData({ name: cardName, onlyStandard: true });
    void searchRefetch();
  };

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
          disabled={addCardLoading}
          onClick={() => {
            addCardMutation({
              cardId: cardInfo.id,
              cardListId: cardListData.id,
              imageUrl: cardInfo.images.large,
              name: cardInfo.name,
            });
          }}
          className="absolute m-2 hidden rounded-full bg-green-700 group-hover:flex"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    );
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
              {cardListData.name}
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
              {cardListData.cards.map((card, index) => {
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
