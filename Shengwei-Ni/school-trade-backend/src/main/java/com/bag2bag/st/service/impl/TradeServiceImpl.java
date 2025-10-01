package com.bag2bag.st.service.impl;

import com.bag2bag.st.entity.Trade;
import com.bag2bag.st.entity.IdleItem;
import com.bag2bag.st.mapper.TradeMapper;
import com.bag2bag.st.mapper.IdleItemMapper;
import com.bag2bag.st.service.TradeService;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;

@Service
public class TradeServiceImpl implements TradeService {
    @Resource private TradeMapper tradeMapper;
    @Resource private IdleItemMapper idleItemMapper;

    @Override
    public boolean addTrade(Trade trade) {
        // 校驗 IdleItem 狀態
        IdleItem item = idleItemMapper.selectByPrimaryKey(trade.getItemId());
        if (item == null || item.getIdleStatus() != 1) {
            return false; // 物品不可交易
        }
        if (item.getUserId().equals(trade.getBuyerId())) {
            return false; // 不能和自己交易
        }

        trade.setStatus(0);    // PROPOSED
        trade.setBuyerOk(0);
        trade.setSellerOk(0);
        trade.setLocked(0);
        trade.setVersion(0);
        return tradeMapper.insert(trade) == 1;
    }

    @Override
    public Trade getTrade(Long id) {
        return tradeMapper.selectById(id);
    }

    @Override
    public boolean sellerRespond(Long id, boolean accept, int version) {
        return accept
                ? tradeMapper.acceptToPending(id, version) == 1
                : tradeMapper.decline(id, version) == 1;
    }

    @Override
    public boolean confirmTrade(Long id, Long userId, String role, int version) {
        Trade t = tradeMapper.selectById(id);
        if (t == null) return false;

        int n = 0;
        if ("buyer".equals(role) && t.getBuyerId().equals(userId)) {
            n = tradeMapper.markBuyerConfirmed(id, version);
        } else if ("seller".equals(role) && t.getSellerId().equals(userId)) {
            n = tradeMapper.markSellerConfirmed(id, version);
        }
        if (n == 0) return false;

        Trade updated = tradeMapper.selectById(id);
        if (updated.getStatus() == 3) { // COMPLETED
            idleItemMapper.updateIdleStatusToOffShelf(updated.getItemId());
        }
        return true;
    }
}
