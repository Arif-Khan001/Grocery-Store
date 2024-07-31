var productModal = $("#productModal");
    $(function () {

        //JSON data by API call
        $.get(productListApiUrl, function (response) {
            if(response) {
                var table = '';
                $.each(response, function(index, product) {
                    table += '<tr data-id="'+ product.product_id +'" data-name="'+ product.name +'" data-unit="'+ product.uom_id +'" data-price="'+ product.price_per_unit +'">' +
                        '<td>'+ product.name +'</td>'+
                        '<td>'+ product.uom_name +'</td>'+
                        '<td>'+ product.price_per_unit +'</td>'+
                        '<td><span class="btn btn-xs btn-danger delete-product">Delete</span></td></tr>';
                });
                $("table").find('tbody').empty().html(table);
            }
        });
    });

    // Save Product
    $("#saveOrder").on("click", function(){
        var formData = $("form").serializeArray();
        var requestPayload = {
            customer_name: null,
            grand_total: null,
            order_details: []
        };
    
        for(var i=0; i<formData.length; ++i) {
            var element = formData[i];
            var lastElement = null;
    
            switch(element.name) {
                case 'customerName':
                    requestPayload.customer_name = element.value;
                    break;
                case 'product_grand_total':
                    requestPayload.grand_total = element.value;
                    break;
                case 'product':
                    requestPayload.order_details.push({
                        product_id: element.value,
                        quantity: null,
                        total_price: null
                    });
                    break;
                case 'qty':
                    lastElement = requestPayload.order_details[requestPayload.order_details.length - 1];
                    lastElement.quantity = element.value;
                    break;
                case 'item_total':
                    lastElement = requestPayload.order_details[requestPayload.order_details.length - 1];
                    lastElement.total_price = element.value;
                    break;
            }
        }
    
        callApi("POST", orderSaveApiUrl, {
            'data': JSON.stringify(requestPayload)
        });
    });

    $(document).on("click", ".delete-product", function (){
        var tr = $(this).closest('tr');
        var data = {
            product_id : tr.data('id')
        };
        var isDelete = confirm("Are you sure to delete "+ tr.data('name') +" item?");
        if (isDelete) {
            callApi("POST", productDeleteApiUrl, data);
        }
    });

    productModal.on('hide.bs.modal', function(){
        $("#id").val('0');
        $("#name, #unit, #price").val('');
        productModal.find('.modal-title').text('Add New Product');
    });

    productModal.on('show.bs.modal', function(){
        //JSON data by API call
        $.get(uomListApiUrl, function (response) {
            if(response) {
                var options = '<option value="">--Select--</option>';
                $.each(response, function(index, uom) {
                    options += '<option value="'+ uom.uom_id +'">'+ uom.uom_name +'</option>';
                });
                $("#uoms").empty().html(options);
            }
        });
    });