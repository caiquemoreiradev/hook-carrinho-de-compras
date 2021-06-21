import Success from '../../assets/images/order_finish.svg';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../util/format';
import { Container } from './styles';

export function FinishOrder() {

    const { cart } = useCart();

    const total =
    formatPrice(
      cart.reduce((sumTotal, product) => {
        sumTotal += product.price * product.amount;

        return sumTotal;
      }, 0)
    )
    return (
        <Container>
            <img src={Success} alt=""/>

            <h1>Pedido finalizado com sucesso</h1>

            <h4>Valor total do pedido {total}</h4>
        </Container>
    )
}