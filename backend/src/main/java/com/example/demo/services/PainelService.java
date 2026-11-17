package com.example.demo.services;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dtos.PainelDTO;
import com.example.demo.models.StatusContrato;
import com.example.demo.models.StatusImovel;
import com.example.demo.models.StatusOferta;
import com.example.demo.repositories.ContratoRepository;
import com.example.demo.repositories.ImovelRepository;
import com.example.demo.repositories.OfertaRepository;

// números do painel do admin: só count/group by no banco, nenhuma lista inteira carregada
@Service
public class PainelService {

    private final ImovelRepository imovelRepository;
    private final OfertaRepository ofertaRepository;
    private final ContratoRepository contratoRepository;

    public PainelService(ImovelRepository imovelRepository, OfertaRepository ofertaRepository,
            ContratoRepository contratoRepository) {
        this.imovelRepository = imovelRepository;
        this.ofertaRepository = ofertaRepository;
        this.contratoRepository = contratoRepository;
    }

    @Transactional(readOnly = true)
    public PainelDTO montar() {
        PainelDTO.Totais totais = new PainelDTO.Totais(
            imovelRepository.countByStatus(StatusImovel.DISPONIVEL),
            ofertaRepository.countByStatus(StatusOferta.PENDENTE),
            contratoRepository.countByStatus(StatusContrato.AGUARDANDO_ASSINATURA)); // cancelado tem outro status

        List<PainelDTO.PorBairro> porBairro = new ArrayList<>();
        for (Object[] linha : imovelRepository.contarPorBairro()) {
            porBairro.add(new PainelDTO.PorBairro((String) linha[0], (Long) linha[1]));
        }

        // os 5 status sempre aparecem (o group by só traz os que têm oferta)
        Map<StatusOferta, Long> contagem = new HashMap<>();
        for (Object[] linha : ofertaRepository.contarPorStatus()) {
            contagem.put((StatusOferta) linha[0], (Long) linha[1]);
        }
        List<PainelDTO.PorStatus> porStatus = new ArrayList<>();
        for (StatusOferta status : StatusOferta.values()) {
            porStatus.add(new PainelDTO.PorStatus(status, contagem.getOrDefault(status, 0L)));
        }

        List<PainelDTO.PorFinalidade> porFinalidade = new ArrayList<>();
        for (Object[] linha : imovelRepository.contarPorFinalidade()) {
            porFinalidade.add(new PainelDTO.PorFinalidade((String) linha[0], (Long) linha[1]));
        }

        return new PainelDTO(totais, porBairro, porStatus, porFinalidade);
    }
}
