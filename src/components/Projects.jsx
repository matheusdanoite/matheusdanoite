import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Button } from 'react95';
import DraggableWindow from './DraggableWindow';

const GridContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 30px;
    justify-content: center;
    padding: 20px;
`;

const ProjectIcon = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100px;
    cursor: pointer;
    text-align: center;
    padding: 10px;
    border: 1px solid transparent;

    &:hover {
        border: 1px dotted ${({ theme }) => theme.borderDark};
        background-color: ${({ theme }) => theme.hoverBackground};
        color: ${({ theme }) => theme.canvasTextInvert};
        
        img {
            filter: none;
        }
    }
`;

const IconImage = styled.img`
    width: 48px;
    height: 48px;
    margin-bottom: 8px;
    image-rendering: pixelated;
`;

const ProjectLabel = styled.span`
    font-size: 1rem;
    line-height: 1.2;
    word-break: break-word;
`;

const ProjectContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 1rem;
`;

const ProjectImage = styled.img`
    width: 100%;
    max-width: 100%; /* Responsive image */
    height: auto;
    border: 2px solid ${({ theme }) => theme.borderDark};
    align-self: center;
`;

const Projects = ({ onNavigate }) => {
    const [activeProject, setActiveProject] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [dynamicHeight, setDynamicHeight] = useState(400); // Base height
    const windowRef = useRef(null);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Effect to measure window height when activeProject changes
    React.useEffect(() => {
        if (activeProject && windowRef.current) {
            const updateHeight = () => {
                const height = windowRef.current.offsetHeight;
                setDynamicHeight(Math.max(400, height + 150)); // Buffer for top/bottom
            };

            // Initial measure
            updateHeight();

            // Watch for size changes (e.g. image loading)
            const resizeObserver = new ResizeObserver(updateHeight);
            resizeObserver.observe(windowRef.current);

            return () => resizeObserver.disconnect();
        } else {
            setDynamicHeight(400); // Reset to default minHeight
        }
    }, [activeProject]);

    React.useEffect(() => {
        if (activeProject && isMobile) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [activeProject, isMobile]);

    const projects = [
        { id: 1, name: 'Hangul Hangover', icon: 'https://win98icons.alexmeub.com/icons/png/console_prompt-0.png' },
        { id: 2, name: 'Cápsula do Tempo', icon: 'https://win98icons.alexmeub.com/icons/png/executable-0.png' },
        { id: 3, name: 'Mestrado', icon: 'https://win98icons.alexmeub.com/icons/png/installer_file_gear-0.png' },
    ];

    const renderProjectContent = (id) => {
        switch (id) {
            case 1:
                return (
                    <ProjectContentWrapper>
                        <p>
                            Incomodados com a falta de representatividade K-popper nas festas, eu e mais quatro amigos decidimos fazer a Hangul Hangover, uma festa em um bar com pista de dança e tudo que uma verdadeira balada tem direito.
                        </p>
                        <p>
                            Foi muito legal produzir a Hangul Hangover e decidir cada detalhe junto com meus amigos, desde inspirações até o evento em si. Primeiramente fizemos uma pesquisa de mercado para descobrir o tamanho do bolo: obtivemos 49 respostas, sendo a maioria esmagadora de pessoas de até 25 anos, ou seja, um público muito jovem, que prefere drinks à cerveja. Decidimos produzi-lo em um pub da minha cidade que possui karaoke e uma pista de dança, um ambiente bem localizado e que precisava de novas festas.
                        </p>
                        <p>
                            Decidida a data, começamos a fase de produção. Tivemos que fazer duzentos ingressos (a capacidade do local). Fazer mesmo. Nós queríamos dar uma experiênia verdadeira de unboxing digna de um álbum de K-pop. É um pouco daquela coisa de vender uma experiência que culmina com o evento, mas que começa no ato da compra. Então foram duzentos envelopes personalizados, cem photocards personalizados do Jjajan, nosso mascote da festa do modelo 1, mais cem do modelo 2, duzentos pôsteres personalizados do evento seguindo uma temática meio SHINee dos anos recentes, e ainda duzentas pulseiras para servirem de ingresso de fato. Ah, e os photocards do mascote eram engraçadinhos, referenciando pontos da cidade, com 50% de chance de drop de cada modelo.
                        </p>
                        <p>
                            No aquecimento até o evento nós fizemos agitação nas redes sociais e atingimos um público curioso; acuado, mas curioso. Esse sentimento se refletiu na pista de dança no início. As pessoas entraram, olharam, e gostaram, pois ficaram. Era só o soju bater na mente e ficar um pouco mais tarde, que prontamente o clima mudou de "reencontro do terceirão" para Hangul Hangover; houve aclamação do totem em tamanho real do JungKook sem camisa feito com papelão e papel sulfite impresso enquanto os meus amigos discotecavam As Mais Mais Do K-pop®. Nessa altura do campeonato já havíamos vendido todos os duzentos ingressos e o próprio dono do local se mostrou surpreso com o resultado, afirmando que nunca viu aquele lugar tão cheio.
                        </p>
                        <p>
                            Ah, e ainda fizemos drinks de soju. Morangos, soju e Sprite. Sold out também.
                        </p>
                        <p>
                            E foi assim que eu ajudei a produzir um evento, do início ao fim, sobre K-pop.
                        </p>
                        <p>
                            Legal, né?
                        </p>
                    </ProjectContentWrapper>
                );
            case 2:
                // Placeholder for Project 2
                return (

                    <ProjectContentWrapper>
                        <p>
                            Desde muito pequeno eu tinha o medo de ser esquecido, acho que isso pega um pouco com todos nós, né? Pra melhor ou pra pior, saber que um dia ninguém mais vai lembrar de mim e que todo o conteúdo produzido é cada vez mais efêmero me fez, desde muito jovem, guardar arquivos.
                        </p>
                        <p>
                            Tenho muitos arquivos, muitos mesmo.<br />
                            Mas os que se destacam são os arquivos das minhas redes sociais.
                        </p>
                        <p>
                            Saudades do orkut.<br />
                            Saudades do Twitter.<br />
                            Saudades do Instagram.
                        </p>
                        <p>
                            Já se foram os tempos da internet baseada em comunicação, agora é a vez da internet baseada em conteúdo.
                        </p>
                        <p>
                            Pois que seja conteúdo!
                        </p>
                        <p>
                            Aqui você tem um compilado dos arquivos das minhas sociais. Depoimentos do orkut? Sim, até isso. Todos os arquivos foram limpos — isto é, passaram por processos de retirada de informações inúteis — e foram estruturados em formatos de fácil acesso. Conteúdo inútil, como likes em vídeos do YouTube, e conteúdo faltando contexto, como respostas a tweets, foram retirados. Aqui é o crème de la crème.
                        </p>
                        <p>
                            O orkut foi onde eu comecei minha vida digital e onde eu vivi a infância cibernética. Muitos tópicos na comunidade t.A.T.u. Brasil, onde eu vivia para celebrar a existência das homofóbicas russas... até que o orkut morreu.
                        </p>
                        <Button onClick={() => onNavigate('orkut')} size="lg" style={{ fontWeight: 'bold', alignSelf: 'center', width: '120px' }}>
                            orkut
                        </Button>
                        <p>
                            O Twitter foi onde eu vivi a adolescência dessa era de redes sociais. Meio porra louca, meio desbocado, muito biscoiteiro, mas sempre fiel a si mesmo. Aqui eu decidi traços de personalidade que fazem eu ser eu. Cortamos relações porque ele traiu aquilo que eu mais valorizo e que, num certo momento, me fez apaixonar por ele: seus ideais.
                        </p>
                        <Button onClick={() => onNavigate('twitter')} size="lg" style={{ fontWeight: 'bold', alignSelf: 'center', width: '120px' }}>
                            Twitter
                        </Button>
                        <p>
                            O Instagram talvez surpreenda. Se os outros eram infância e adolescência, aqui é a vida de um jovem adulto. Em formato de diário, eu tinha o hábito de postar todos os dias antes de dormir. Escrevi muito, relatei muitas histórias e falei coisas que talvez não falaria assim publicamente, mas não me arrependo. As pessoas gostavam de acompanhar o @matheusdodia, acho que seu branding de "diário público" pegou essa lógica de perfil privado para postar foto de festas e subverteu ela, mostrando um indivíduo mais cru.
                        </p>
                        <Button onClick={() => onNavigate('instagram')} size="lg" style={{ fontWeight: 'bold', alignSelf: 'center', width: '120px' }}>
                            Instagram
                        </Button>
                        <p>
                            Ah, eu também fiz boa parte do trabalho do redesenho das interfaces. Tentei reproduzir o layout e a experiência de cada um dos serviços em um navegador. Funciona, mas não testei em muitas máquinas e foi tudo vibecoded, o que talvez faça alguns broxarem, mas aí já não é problema meu. Você pode conferir o código dessas implementações no meu GitHub, no repositório deste saity.
                        </p>
                    </ProjectContentWrapper>
                );
            case 3:
                // Placeholder for Project 3
                return (
                    <ProjectContentWrapper>
                        <p>Quando falei desse saity, o meu orientador de mestrado disse para incluir o mestrado.</p><p>É isso, eu faço mestrado também.</p><p>Bioenergia, uma loucura.</p>
                        <Button onClick={() => setActiveProject(null)} size="lg" style={{ fontWeight: 'bold', alignSelf: 'center', width: '120px' }}>
                            OK
                        </Button>
                    </ProjectContentWrapper>
                );
            default:
                return <p>Conteúdo em desenvolvimento...</p>;
        }
    };

    const getProjectTitle = (id) => {
        const proj = projects.find(p => p.id === id);
        return proj ? proj.name : 'Projeto';
    };

    return (
        <div style={{ position: 'relative', width: '100%', minHeight: `${dynamicHeight}px`, display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'min-height 0.3s ease' }}>
            {/* Icons Grid */}
            <GridContainer>
                {projects.map((project) => (
                    <ProjectIcon key={project.id} onClick={() => setActiveProject(project.id)}>
                        <IconImage src={project.icon} alt={project.name} />
                        <ProjectLabel>{project.name}</ProjectLabel>
                    </ProjectIcon>
                ))}
            </GridContainer>

            {/* Draggable Window (Overlay) */}
            {activeProject && (
                isMobile ? (
                    // Mobile: Fixed Overlay BELOW Nav Bar
                    <div style={{
                        position: 'fixed',
                        top: '40px',
                        left: 0,
                        width: '100vw',
                        height: 'calc(100vh - 40px)',
                        zIndex: 2000,
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        overflowY: 'auto',
                        WebkitOverflowScrolling: 'touch',
                        paddingBottom: '150px'
                    }}
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setActiveProject(null);
                        }}
                    >
                        <DraggableWindow
                            id={`project-${activeProject}`}
                            title={getProjectTitle(activeProject)}
                            onClose={() => setActiveProject(null)}
                            onFocus={() => { }}
                            isMobile={true}
                            style={{
                                width: '90%',
                                maxWidth: '600px',
                                marginTop: '20px',
                                marginBottom: '20px',
                                position: 'relative'
                            }}
                            windowStyle={{ width: '100%', display: 'flex', flexDirection: 'column' }}
                        >
                            <div style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
                                {renderProjectContent(activeProject)}
                            </div>
                        </DraggableWindow>
                    </div>
                ) : (
                    // Desktop: Draggable & Responsive
                    <DraggableWindow
                        id={`project-${activeProject}`}
                        title={getProjectTitle(activeProject)}
                        onClose={() => setActiveProject(null)}
                        onFocus={() => { }} // Single active project, no Z-index management needed yet
                        isMobile={false}
                        style={{
                            position: 'absolute',
                            zIndex: 1000,
                            top: '0px',
                            left: '15vw',
                            width: '100vw',
                            minWidth: '320px',
                            maxWidth: '1000px',
                        }}
                        windowStyle={{ width: '100%', maxWidth: '100%' }}
                    >
                        <div ref={windowRef} style={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                            {renderProjectContent(activeProject)}
                        </div>
                    </DraggableWindow>
                )
            )}
        </div>
    );
};

export default Projects;
