from datetime import datetime
from sql_connection import get_sql_connection

def insert_order(connection, order):
    cursor = connection.cursor()

    # Insert into orders table
    order_query = ("INSERT INTO orders "
                   "(customer_name, total, date_time) "
                   "VALUES (%s, %s, %s)")
    order_data = (order['customer_name'], float(order['grand_total']), datetime.now())
    cursor.execute(order_query, order_data)
    order_id = cursor.lastrowid

    # Insert into order_details table
    order_details_query = ("INSERT INTO order_details "
                           "(order_id, product_id, quantity, total_price) "
                           "VALUES (%s, %s, %s, %s)")
    order_details_data = [
        (order_id, int(detail['product_id']), float(detail['quantity']), float(detail['total_price']))
        for detail in order['order_details']
    ]

    cursor.executemany(order_details_query, order_details_data)
    connection.commit()

    cursor.close()
    return order_id


def get_order_details(connection, order_id):
    cursor = connection.cursor()
    query = ("SELECT order_details.order_id, order_details.quantity, order_details.total_price, "
             "products.name, products.price_per_unit FROM order_details "
             "LEFT JOIN products ON order_details.product_id = products.product_id "
             "WHERE order_details.order_id = %s")
    cursor.execute(query, (order_id,))
    records = cursor.fetchall()
    cursor.close()

    return [
        {
            'order_id': record[0],
            'quantity': record[1],
            'total_price': record[2],
            'product_name': record[3],
            'price_per_unit': record[4]
        }
        for record in records
    ]

def get_all_orders(connection):
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM orders")
    orders = cursor.fetchall()
    cursor.close()

    response = [
        {
            'order_id': order[0],
            'customer_name': order[1],
            'total': order[2],
            'datetime': order[3],
            'order_details': get_order_details(connection, order[0])
        }
        for order in orders
    ]

    return response

if __name__ == '__main__':
    connection = get_sql_connection()
    try:
        order_id = insert_order(connection, {
            'customer_name': 'hulk',
            'grand_total': 500,
            'order_details': [
                {
                    'product_id': 1,
                    'quantity': 2,
                    'total_price': 50
                },
                {
                    'product_id': 3,
                    'quantity': 1,
                    'total_price': 30
                }
            ]
        })
        print(f"Inserted order with ID: {order_id}")
    except Exception as e:
        print("Failed to insert order:", e)

    all_orders = get_all_orders(connection)

