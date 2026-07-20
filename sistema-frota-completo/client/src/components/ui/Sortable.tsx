import React, { useRef, useState } from "react";
import { useSortable } from "@dnd-kit/react/sortable";
import { Button } from "./button";
import { Move, X } from "lucide-react";

interface PedidosBuscadosProps {
  ordernumber: string;
  status: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
  address_number: string;
  sequence: number;
  client_name: string;
  pedido: string;
  reason: string;
}

interface SortableProps {
  id: number;
  index: number;
  p: PedidosBuscadosProps;
  setP: React.Dispatch<React.SetStateAction<PedidosBuscadosProps>>;
  setPA: React.Dispatch<React.SetStateAction<PedidosBuscadosProps[]>>;
  pA: PedidosBuscadosProps[];
}

function Sortable({ id, index, p, setP, setPA, pA, ...props }: SortableProps) {
  // const { ref } = useSortable({ id, index });
  const [element, setElement] = useState<Element | null>(null);
  const handleRef = useRef<HTMLButtonElement | null>(null);
  const { isDragging } = useSortable({ id, index, element, handle: handleRef });

  console.log(p);

  return (
    <li
      ref={setElement}
      className="p-4 flex items-center justify-between bg-slate-100 rounded"
      data-shadow={isDragging || undefined}
    >
      <div className="flex gap-6 pl-3">
        {/* <div className=""></div> */}
        <div className="flex h-fill items-center justify-center">
          <h3 className="">{p.sequence}º</h3>
        </div>
        <div>
          <p className="text-base font-bold">
            {!p?.ordernumber
              ? `${p?.reason}`
              : `Nota: ${p?.ordernumber} - ${p?.client_name}`}
          </p>
          {p?.pedido ? (
            <p className="text-sm font-bold pl-2">Pedido: #{p?.pedido}</p>
          ) : (
            ""
          )}

          <p className="text-xs text-slate-500 pl-2">
            {p?.address.replace(",", "")}, {p?.address_number}, {p?.city}
          </p>
        </div>
      </div>
      <div className="flex">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPA(pA?.filter((_: any, idx: any) => idx !== index))}
          className="text-red-500"
        >
          <X size={16} />
        </Button>
        <button ref={handleRef}>
          <Move size={16} />
          {/* <X size={16} /> */}
        </button>
      </div>
    </li>
  );
}

export { Sortable };
