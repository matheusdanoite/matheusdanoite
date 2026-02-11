import React, { forwardRef } from 'react';

const BioContent = forwardRef((props, ref) => {
    return (
        <div ref={ref} style={{ padding: '1rem', width: '100%' }}>
            <h3 style={{ marginTop: 0 }}>É...</h3>
            <p>
                Não sei se tem muita coisa aqui, mas entre!
            </p>
            <br />
            <p>
                Fique à vontade, só não repare na bagunça, estamos meio que em construção.
            </p>
            <br />
            <p>
                O que eu sei que tem por aqui é um hub com tudo que há de Matheus. O sonho de poucos e o pesadelo de outros.
            </p>
            <br />
            <p>
                Talvez seja exposição demais de si mesmo para alguns, mas eu penso que seria legal gerar um acervo digital do que quer que eu faça e manter aqui, além de ser um espaço para publicar coisas e colocar um sorriso no rosto das pessoas — se procurar bem tem umas piadas boas e coisas para se ver.
            </p>
            <br />
            <p>
                É tipo Internet<br />
                É meio que tudo que eu quiser.
            </p>
        </div>
    );
});

export default BioContent;
