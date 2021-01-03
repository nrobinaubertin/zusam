<?php

namespace App\Entity;

use App\Service\Uuid;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use Nelmio\ApiDocBundle\Annotation\Model;
use OpenApi\Annotations as OA;

/**
 * @ORM\Table(name="`group`")
 * @ORM\Entity
 */
class Group
{
    /**
     * @ORM\Id
     * @ORM\Column(type="guid")
     * @Groups("*")
     * @Assert\NotBlank()
     * @OA\Property(type="guid")
     */
    private $id;

    /**
     * @ORM\Column(type="string", unique=true)
     * @Groups({"read_group"})
     * @Assert\NotBlank()
     * @OA\Property(type="string")
     */
    private $secretKey;

    /**
     * @ORM\Column(type="integer")
     * @Assert\Type("integer")
     * @Assert\NotNull()
     * @OA\Property(type="integer")
     */
    private $createdAt;

    /**
     * @ORM\Column(type="string")
     * @Groups("*")
     * @Assert\NotBlank()
     * @OA\Property(type="string")
     */
    private $name;

    /**
     * @ORM\ManyToMany(targetEntity="App\Entity\User", mappedBy="groups")
     * @Groups({"read_group", "write_group"})
     * @OA\Property(type="array", @OA\Items(type="App\Entity\User"))
     */
    private $users;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\Message", mappedBy="group")
     * @OA\Property(type="array", @OA\Items(type="App\Entity\Message"))
     */
    private $messages;

    /**
     * @ORM\Column(type="integer", nullable=true)
     * @Groups({"read_group", "read_me"})
     * @Assert\Type("integer")
     * @OA\Property(type="integer")
     */
    private $lastActivityDate;

    /**
     * @ORM\Column(type="json", nullable=true)
     * @OA\Property(type="object")
     */
    private $data;

    /**
     * @Groups("*")
     * @OA\Property(type="string")
     */
    private $entityType;

    public function getEntityType(): string
    {
        return strtolower((new \ReflectionClass($this))->getShortName());
    }

    public function __construct()
    {
        $this->id = Uuid::uuidv4();
        $this->users = new ArrayCollection();
        $this->messages = new ArrayCollection();
        $this->createdAt = time();
        $this->secretKey = Uuid::uuidv4();
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getSecretKey(): string
    {
        return $this->secretKey;
    }

    public function resetSecretKey(): void
    {
        $this->secretKey = Uuid::uuidv4();
    }

    public function getCreatedAt(): int
    {
        return $this->createdAt;
    }

    public function setCreatedAt(int $createdAt): void
    {
        $this->createdAt = $createdAt;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function getUsers(): Collection
    {
        return $this->users;
    }

    public function addUser(User $user): self
    {
        $this->users[] = $user;

        return $this;
    }

    public function removeUser(User $user): self
    {
        $this->users->removeElement($user);

        return $this;
    }

    public function getUsersAsArray(): array
    {
        return $this->users->toArray();
    }

    public function getMessages(): Collection
    {
        return $this->messages;
    }

    public function addMessage(Message $message): void
    {
        $this->messages[] = $message;
    }

    public function removeMessage(Message $message): void
    {
        $this->messages->removeElement($message);
    }

    public function getLastActivityDate(): int
    {
        return $this->lastActivityDate ?? 0;
    }

    public function setLastActivityDate(?int $lastActivityDate): void
    {
        $this->lastActivityDate = $lastActivityDate ?? 0;
    }

    public function getData(): ?array
    {
        return $this->data;
    }

    public function setData(?array $data): void
    {
        $this->data = $data;
    }
}
