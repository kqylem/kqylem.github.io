 ##### Definition of Linear Dependence (pg. 36)
A subset $S$ of a [[Vector Space]] $V$ is called __linearly dependent__ if there exist a finite number of distinct vectors $u_{1},u_{2}, ..., u_{n} \in S$ and scalars $a_{1},a_{2}, ...,a_{n}$ not all zero such that:
$$ a_{1}u_{1}+a_{2}u_{2} + \cdots + a_{n}u_{n} = v$$
In this case, we say that the vectors in $S$ are linearly dependent. 

-----
###### Definition of Linear Independence (pg. 37)
A subset $S$ of a vector space $V$ is __linearly independent__ if it is not linearly dependent. As before, we say that the vectors of $S$ are linearly independent. 

*Important facts about linearly independent sets:*
1. the empty set is a linearly independent set because a linearly dependent set must be non-empty. 
2. a set consisting of one non-zero vector is linearly independent. 
3. a set is linearly independent if the zero vector can only be expressed by the trivial solution, i.e. the only representations of 0 via linear combinations is the trivial solution. (all coefficients of the lin comb are zero)

---
#### Theorem 1.6 (pg. 39)
Let $V$ be a vector space, and let $S_{1}\subseteq S_{2} \subseteq V$. Then if $S_{1}$ is linearly dependent, $S_{2}$ must be linearly dependent.

###### Corollary 
Let $V$ be a vector space, and let $S_{1}\subseteq S_{2} \subseteq V$. Then if $S_{2}$ is linearly independent, $S_{1}$ must be linearly independent. 


------
### Theorem 1.7 (pg. 39)
Let $S$ be a linearly independent subset of a vector space $V$, and let $v$ be a vector in $V$ but not in $S$. Then, $S \cup \{v\}$ is linearly dependent iff $v \in span(S)$.

