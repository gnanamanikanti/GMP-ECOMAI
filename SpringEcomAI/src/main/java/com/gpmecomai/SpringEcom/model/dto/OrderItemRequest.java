package com.gpmecomai.SpringEcom.model.dto;

public record OrderItemRequest(
        int productId,
        int quantity
) {}
